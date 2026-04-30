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

  const handleRoll = async () => {
    if (profile.dice_count < 1) {
      setMsg('Dadu tidak cukup! Silakan klaim harian atau beli.');
      return;
    }

    setIsFetching(true);
    setIsRollDisabled(true);
    setResult(null);
    setMsg('');
    setFlashClass('');

    try {
      await supabase
        .from('profiles')
        .update({ dice_count: profile.dice_count - 1 })
        .eq('id', user.id);
      fetchProfile(user.id);

      let selectedTier = getRandomTier();

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

        if (!allAvailable || allAvailable.length === 0) {
          throw new Error('Maaf, mesin gacha sedang kosong!');
        }

        poolItems = allAvailable.filter((item) => {
          if (item.tier === 'LIMITED' && item.user_waifus.length > 0)
            return false;
          return true;
        });

        if (poolItems.length === 0) {
          throw new Error(
            'Wah! Semua waifu LIMITED sudah habis dimiliki pemain lain.',
          );
        }
      }

      const randomWaifu =
        poolItems[Math.floor(Math.random() * poolItems.length)];

      await supabase
        .from('user_waifus')
        .insert([{ user_id: user.id, waifu_id: randomWaifu.id }]);

      await supabase
        .from('gacha_history')
        .insert([{ user_id: user.id, waifu_id: randomWaifu.id }]);

      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsFetching(false);
      setResult(randomWaifu);

      if (randomWaifu.tier === 'SSR') setFlashClass('flash-ssr');
      else if (randomWaifu.tier === 'UR') setFlashClass('flash-ur');
      else if (randomWaifu.tier === 'LIMITED') setFlashClass('flash-limited');

      if (['SSR', 'UR', 'LIMITED'].includes(randomWaifu.tier)) {
        const audio = new Audio(
          'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
        );
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
