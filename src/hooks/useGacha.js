import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { DROP_RATES } from '../config/gachaConfig';

export function useGacha(user, profile, fetchProfile) {
  const [isFetching, setIsFetching] = useState(false);
  const [isRollDisabled, setIsRollDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [flashClass, setFlashClass] = useState('');
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState('');
  const [showRates, setShowRates] = useState(false);

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
      // Potong dadu sekaligus
      await supabase
        .from('profiles')
        .update({ dice_count: profile.dice_count - count })
        .eq('id', user.id);
      fetchProfile(user.id);

      const results = [];
      const userWaifusToInsert = [];
      const gachaHistoryToInsert = [];

      // Loop untuk setiap roll
      for (let i = 0; i < count; i++) {
        let selectedTier = getRandomTier();
        
        // Ambil item dari pool (bisa dioptimasi dengan ambil semua pool dulu, tapi untuk kesederhanaan tetap per tier)
        let { data: poolItems } = await supabase
          .from('waifu_pool')
          .select('*, user_waifus(id)')
          .eq('tier', selectedTier);

        if (selectedTier === 'LIMITED') {
          poolItems = poolItems.filter((item) => item.user_waifus.length === 0);
        }

        if (!poolItems || poolItems.length === 0) {
          const { data: allAvailable } = await supabase
            .from('waifu_pool')
            .select('*, user_waifus(id)');

          poolItems = allAvailable.filter((item) => {
            if (item.tier === 'LIMITED' && item.user_waifus.length > 0) return false;
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
        await supabase.from('user_waifus').insert(userWaifusToInsert);
        await supabase.from('gacha_history').insert(gachaHistoryToInsert);
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsFetching(false);
      setResult(count === 1 ? results[0] : results);

      // Flash & Sound (Hanya jika dapat SSR/UR/LIMITED di salah satu roll)
      const hasHighTier = results.some(r => ['SSR', 'UR', 'LIMITED'].includes(r.tier));
      const bestWaifu = [...results].sort((a, b) => {
        const tiers = ['LIMITED', 'UR', 'SSR', 'SR', 'S', 'R', 'A', 'B', 'C'];
        return tiers.indexOf(a.tier) - tiers.indexOf(b.tier);
      })[0];

      if (bestWaifu.tier === 'SSR') setFlashClass('flash-ssr');
      else if (bestWaifu.tier === 'UR') setFlashClass('flash-ur');
      else if (bestWaifu.tier === 'LIMITED') setFlashClass('flash-limited');

      if (hasHighTier) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch((e) => console.log('Audio play error:', e));
      }

      setCountdown(2);
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      setTimeout(() => {
        setIsRollDisabled(false);
        setCountdown(0);
        clearInterval(timer);
        setFlashClass('');
      }, 2000);
    } catch (error) {
      setMsg(error.message);
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
