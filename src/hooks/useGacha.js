import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DROP_RATES } from '../config/gachaConfig';
import { playGachaSound, getFlashClassByTier, getBestTier } from '../lib/gachaEffects';

export function useGacha(user, profile, fetchProfile) {
  const [isFetching, setIsFetching] = useState(false);
  const [isRollDisabled, setIsRollDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [flashClass, setFlashClass] = useState('');
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState('');
  const [showRates, setShowRates] = useState(false);
  const timerRef = useRef(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const getRandomTier = () => {
    const rand = Math.random() * 100;
    let cumulative = 0;
    for (const rate of DROP_RATES) {
      cumulative += rate.chance;
      if (rand <= cumulative) return rate.tier;
    }
    return 'C';
  };

  const handleRoll = async (count = 1) => {
    if (profile.dice_count < count) {
      setMsg(`Dadu tidak cukup! Butuh ${count} dadu.`);
      return;
    }

    setIsFetching(true);
    setIsRollDisabled(true);
    setResult(null);
    setMsg('');
    setFlashClass('');

    try {
      // 1. Potong dadu (dengan retry sederhana jika gagal koneksi)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ dice_count: profile.dice_count - count })
        .eq('id', user.id);
      
      if (updateError) throw new Error("Gagal memproses dadu. Coba lagi.");

      // Refresh profile data
      await fetchProfile(user.id);

      const results = [];
      const userWaifusToInsert = [];
      const gachaHistoryToInsert = [];

      // 2. Simulasi Roll logic
      for (let i = 0; i < count; i++) {
        let selectedTier = getRandomTier();
        
        let { data: poolItems, error: fetchError } = await supabase
          .from('waifu_pool')
          .select('*, user_waifus(id)')
          .eq('tier', selectedTier);

        if (fetchError) throw new Error("Gagal mengambil data pool.");

        if (selectedTier === 'LIMITED') {
          poolItems = poolItems.filter((item) => item.user_waifus.length === 0);
        }

        if (!poolItems || poolItems.length === 0) {
          const { data: allAvailable } = await supabase
            .from('waifu_pool')
            .select('*, user_waifus(id)');

          poolItems = (allAvailable || []).filter((item) => {
            if (item.tier === 'LIMITED' && (item.user_waifus?.length || 0) > 0) return false;
            return true;
          });
        }

        if (poolItems && poolItems.length > 0) {
          const randomWaifu = poolItems[Math.floor(Math.random() * poolItems.length)];
          results.push(randomWaifu);
          userWaifusToInsert.push({ user_id: user.id, waifu_id: randomWaifu.id });
          gachaHistoryToInsert.push({ user_id: user.id, waifu_id: randomWaifu.id });
        }
      }

      if (results.length > 0) {
        // Batch insert
        const { error: insertError } = await supabase.from('user_waifus').insert(userWaifusToInsert);
        if (insertError) throw new Error("Gagal menyimpan waifu ke inventory.");
        
        await supabase.from('gacha_history').insert(gachaHistoryToInsert);
      } else {
        throw new Error("Mesin gacha sedang kosong!");
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsFetching(false);
      setResult(count === 1 ? results[0] : results);

      // Trigger effects
      const bestTier = getBestTier(results);
      setFlashClass(getFlashClassByTier(bestTier));
      playGachaSound(bestTier);

      // Clear flash after 2s
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setFlashClass('');
        setIsRollDisabled(false);
      }, 2000);

    } catch (error) {
      setMsg(error.message || "Terjadi kesalahan sistem.");
      setIsFetching(false);
      setIsRollDisabled(false);
    }
  };

  return {
    isFetching,
    isRollDisabled,
    countdown,
    flashClass,
    result,
    msg,
    showRates,
    setShowRates,
    handleRoll,
  };
}
