import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DROP_RATES } from '../config/gachaConfig';

const SUCCESS_AUDIO_URL = 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3';

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

      const hasHighTier = results.some(r => ['SSR', 'UR', 'LIMITED'].includes(r.tier));
      const bestWaifu = [...results].sort((a, b) => {
        const tiers = ['LIMITED', 'UR', 'SSR', 'SR', 'S', 'R', 'A', 'B', 'C'];
        return tiers.indexOf(a.tier) - tiers.indexOf(b.tier);
      })[0];

      if (bestWaifu.tier === 'SSR') setFlashClass('flash-ssr');
      else if (bestWaifu.tier === 'UR') setFlashClass('flash-ur');
      else if (bestWaifu.tier === 'LIMITED') setFlashClass('flash-limited');

      if (hasHighTier) {
        const audio = new Audio(SUCCESS_AUDIO_URL);
        audio.volume = 0.5;
        audio.play().catch((e) => console.log('Audio play error:', e));
      }

      setCountdown(2);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      setTimeout(() => {
        setIsRollDisabled(false);
        setCountdown(0);
        if (timerRef.current) clearInterval(timerRef.current);
        setFlashClass('');
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
