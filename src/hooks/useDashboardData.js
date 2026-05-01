import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { PRICE_MAP, DICE_PRICE } from '../config/gachaConfig';

export function useDashboardData(user, profile, fetchProfile) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimMsg, setClaimMsg] = useState('');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [sellingWaifu, setSellingWaifu] = useState(null);
  const [sellAmount, setSellAmount] = useState(1);
  const [isBuyingDice, setIsBuyingDice] = useState(false);
  const [buyAmount, setBuyAmount] = useState(1);
  const [selectedPoolIds, setSelectedPoolIds] = useState([]);
  const claimTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (claimTimerRef.current) clearTimeout(claimTimerRef.current);
    };
  }, []);

  const fetchInventory = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_waifus')
        .select('id, waifu_pool(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const grouped = data.reduce((acc, curr) => {
          const w = curr.waifu_pool;
          if (!acc[w.id]) {
            acc[w.id] = { ...w, total: 0, instanceIds: [] };
          }
          acc[w.id].total += 1;
          acc[w.id].instanceIds.push(curr.id);
          return acc;
        }, {});
        setInventory(Object.values(grouped).sort((a, b) => b.total - a.total));
      }
    } catch (err) {
      console.error("Fetch inventory error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchInventory();
  }, [user, fetchInventory]);

  const handleDailyClaim = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      if (profile.last_daily_claim === today) {
        setClaimMsg('Anda sudah klaim hadiah hari ini!');
        if (claimTimerRef.current) clearTimeout(claimTimerRef.current);
        claimTimerRef.current = setTimeout(() => setClaimMsg(''), 3000);
        return;
      }

      const newDice = (profile.dice_count || 0) + 10;
      const { error } = await supabase
        .from('profiles')
        .update({ dice_count: newDice, last_daily_claim: today })
        .eq('id', user.id);

      if (error) throw error;

      setClaimMsg('+10 Dadu Berhasil Diklaim!');
      await fetchProfile(user.id);
      if (claimTimerRef.current) clearTimeout(claimTimerRef.current);
      claimTimerRef.current = setTimeout(() => setClaimMsg(''), 3000);
    } catch (err) {
      setClaimMsg('Gagal klaim harian.');
      console.error(err);
    }
  };

  const confirmBuyDice = async () => {
    const totalCost = buyAmount * DICE_PRICE;
    if (profile.coins < totalCost) {
      return { error: 'Koin tidak cukup!' };
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          coins: profile.coins - totalCost,
          dice_count: profile.dice_count + buyAmount,
        })
        .eq('id', user.id);

      if (error) throw error;

      await fetchProfile(user.id);
      setIsBuyingDice(false);
      setBuyAmount(1);
      return { error: null };
    } catch (err) {
      console.error(err);
      return { error: 'Gagal membeli dadu.' };
    } finally {
      setLoading(false);
    }
  };

  const handleSell = (waifu) => {
    setSellingWaifu(waifu);
    setSellAmount(1);
  };

  const confirmSell = async () => {
    if (!sellingWaifu || sellAmount < 1) return;

    try {
      setLoading(true);
      const finalAmount = Math.min(sellAmount, sellingWaifu.total);
      const idsToSell = sellingWaifu.instanceIds.slice(0, finalAmount);
      const pricePerUnit = PRICE_MAP[sellingWaifu.tier] || 10;
      const totalPrice = pricePerUnit * finalAmount;

      const { error: delError } = await supabase.from('user_waifus').delete().in('id', idsToSell);
      if (delError) throw delError;

      const { error: updError } = await supabase
        .from('profiles')
        .update({ coins: (profile.coins || 0) + totalPrice })
        .eq('id', user.id);
      
      if (updError) throw updError;

      await fetchProfile(user.id);
      await fetchInventory();
      setSellingWaifu(null);
    } catch (err) {
      console.error("Sell error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectPoolId = (poolId) => {
    setSelectedPoolIds((prev) =>
      prev.includes(poolId)
        ? prev.filter((id) => id !== poolId)
        : [...prev, poolId],
    );
  };

  const calculateBulkSellInfo = () => {
    const waifusToSell = inventory.filter((w) =>
      selectedPoolIds.includes(w.id),
    );
    
    let totalEarned = 0;
    let totalUnits = 0;
    let allIdsToSell = [];

    waifusToSell.forEach((w) => {
      const pricePerUnit = PRICE_MAP[w.tier] || 10;
      totalEarned += pricePerUnit * w.total;
      totalUnits += w.total;
      allIdsToSell = [...allIdsToSell, ...w.instanceIds];
    });

    return { totalEarned, totalUnits, allIdsToSell };
  };

  const confirmBulkSell = async () => {
    if (selectedPoolIds.length === 0) return;

    try {
      setLoading(true);
      const { totalEarned, allIdsToSell } = calculateBulkSellInfo();

      if (allIdsToSell.length > 0) {
        const { error: delError } = await supabase.from('user_waifus').delete().in('id', allIdsToSell);
        if (delError) throw delError;

        const { error: updError } = await supabase
          .from('profiles')
          .update({ coins: (profile.coins || 0) + totalEarned })
          .eq('id', user.id);
        
        if (updError) throw updError;
      }

      await fetchProfile(user.id);
      await fetchInventory();
      setSelectedPoolIds([]);
    } catch (err) {
      console.error("Bulk sell error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchName = item.name.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter ? item.tier === tierFilter : true;
    return matchName && matchTier;
  });

  return {
    inventory,
    loading,
    claimMsg,
    search,
    setSearch,
    tierFilter,
    setTierFilter,
    sellingWaifu,
    setSellingWaifu,
    sellAmount,
    setSellAmount,
    isBuyingDice,
    setIsBuyingDice,
    buyAmount,
    setBuyAmount,
    selectedPoolIds,
    setSelectedPoolIds,
    toggleSelectPoolId,
    confirmBulkSell,
    calculateBulkSellInfo,
    filteredInventory,
    handleDailyClaim,
    confirmBuyDice,
    handleSell,
    confirmSell,
    fetchInventory,
  };
}
