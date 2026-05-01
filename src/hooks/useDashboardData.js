import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { PRICE_MAP, DICE_PRICE } from '../config/gachaConfig';
import { toast } from 'react-hot-toast';

export function useDashboardData(user, profile, fetchProfile) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
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
      // Panggil Database Function (RPC) - AMAN
      const { data, error: rpcError } = await supabase.rpc('claim_daily_secure');

      if (rpcError) throw new Error(rpcError.message || "Gagal klaim hadiah.");

      toast.success(data.message || '+10 Dadu Berhasil Diklaim!');
      await fetchProfile(user.id);
    } catch (err) {
      toast.error(err.message || 'Gagal klaim harian.');
      console.error(err);
    }
  };

  const confirmBuyDice = async () => {
    try {
      setLoading(true);
      // Panggil Database Function (RPC) - AMAN & ANTI-CHEAT
      const { data, error } = await supabase.rpc('buy_dice_secure', { 
        amount: buyAmount 
      });

      if (error) throw new Error(error.message || 'Gagal membeli dadu.');

      toast.success(`Berhasil membeli ${buyAmount} dadu!`);
      await fetchProfile(user.id);
      setIsBuyingDice(false);
      setBuyAmount(1);
      return { error: null };
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Gagal membeli dadu.');
      return { error: err.message };
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

      // Panggil Database Function (RPC) - AMAN & ANTI-CHEAT
      const { data, error: rpcError } = await supabase.rpc('sell_waifus_secure', { 
        instance_ids: idsToSell 
      });

      if (rpcError) throw new Error(rpcError.message || "Gagal menjual waifu.");

      toast.success(`Berhasil menjual waifu! +${data.earned} koin.`);
      
      await fetchProfile(user.id);
      await fetchInventory();
      setSellingWaifu(null);
    } catch (err) {
      console.error("Sell error:", err);
      toast.error(err.message || "Gagal menjual.");
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
      const { allIdsToSell } = calculateBulkSellInfo();

      if (allIdsToSell.length > 0) {
        // Panggil Database Function (RPC) - AMAN & ANTI-CHEAT
        const { data, error: rpcError } = await supabase.rpc('sell_waifus_secure', { 
          instance_ids: allIdsToSell 
        });

        if (rpcError) throw new Error(rpcError.message || "Gagal menjual waifu massal.");

        toast.success(`Berhasil menjual ${allIdsToSell.length} waifu! +${data.earned} koin.`);
      }

      await fetchProfile(user.id);
      await fetchInventory();
      setSelectedPoolIds([]);
    } catch (err) {
      console.error("Bulk sell error:", err);
      toast.error(err.message || "Gagal menjual massal.");
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
