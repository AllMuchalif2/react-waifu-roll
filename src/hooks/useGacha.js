import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DROP_RATES, DICE_PRICE } from '../config/gachaConfig';
import { playGachaSound, getFlashClassByTier, getBestTier } from '../lib/gachaEffects';
import { toast } from 'react-hot-toast';

export function useGacha(user, profile, fetchProfile) {
  const [isFetching, setIsFetching] = useState(false);
  const [isRollDisabled, setIsRollDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [flashClass, setFlashClass] = useState('');
  const [result, setResult] = useState(null);
  const [showRates, setShowRates] = useState(false);
  const timerRef = useRef(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);


  const handleRoll = async (count = 1) => {
    if (profile.dice_count < count) {
      toast.error(`Butuh ${count} dadu!`);
      return;
    }

    setIsFetching(true);
    setResult(null);
    setIsRollDisabled(true);
    setFlashClass('');

    try {
      // 1. Panggil Database Function (RPC) - AMAN & ANTI-CHEAT
      const { data: results, error: rpcError } = await supabase.rpc('roll_gacha_secure', { 
        roll_count: count 
      });

      if (rpcError) throw new Error(rpcError.message || "Gagal menggacha.");

      // 2. Refresh profil untuk melihat sisa dadu terbaru
      await fetchProfile(user.id);

      setIsFetching(false);
      setResult(count === 1 ? results[0] : results);

      // 3. Trigger effects
      const bestTier = getBestTier(results);
      setFlashClass(getFlashClassByTier(bestTier));
      playGachaSound(bestTier);

      // 4. Clear flash after 2s
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setFlashClass('');
        setIsRollDisabled(false);
      }, 2000);

    } catch (error) {
      toast.error(error.message || "Terjadi kesalahan sistem.");
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
    showRates,
    setShowRates,
    handleRoll,
  };
}
