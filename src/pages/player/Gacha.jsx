import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import WaifuCard from '../../components/WaifuCard';
import { DROP_RATES, PRICE_MAP } from '../../config/gachaConfig';

export default function Gacha() {
  const { user, profile, fetchProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isFetching, setIsFetching] = useState(false);
  const [isRollDisabled, setIsRollDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [flashClass, setFlashClass] = useState('');

  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState('');
  const [showRates, setShowRates] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

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

  if (!profile) return null;

  return (
    <>
      {flashClass && <div className={`screen-flash ${flashClass}`}></div>}

      <Navbar />
      <main className="px-4 max-w-md mx-auto text-center pb-24">
        <div className="flex justify-center gap-2 mb-8">
          <div className="inline-flex items-center gap-2 bg-border-main text-bg-main px-4 py-2 rounded-xl font-bold border-2 border-primary-blue shadow-[4px_4px_0px_var(--color-secondary-yellow)]">
            <i className="fa-solid fa-dice"></i> Dadu: {profile.dice_count}
          </div>
          <button
            onClick={() => setShowRates(!showRates)}
            className="w-10 h-10 bg-card-bg border-2 border-border-main rounded-xl flex items-center justify-center shadow-[4px_4px_0px_var(--border)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            title="Info Rate"
          >
            <i className="fa-solid fa-circle-info text-primary-blue"></i>
          </button>
        </div>

        {showRates && (
          <div className="card-neo mb-6 bg-card-bg text-left animate-fade-in relative">
            <button
              onClick={() => setShowRates(false)}
              className="absolute top-2 right-2 text-text-muted hover:text-danger"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <h3 className="text-sm font-black mb-3 border-b-2 border-border-main pb-1 uppercase italic">
              Gacha Rates & Prices
            </h3>
            <div className="flex flex-col gap-1">
              {DROP_RATES.map((r) => (
                <div
                  key={r.tier}
                  className="flex justify-between text-[0.7rem]"
                >
                  <span className="font-bold">
                    {r.label || r.tier} ({r.tier})
                  </span>
                  <div className="flex gap-3">
                    <span className="text-primary-blue font-black">
                      {r.chance}%
                    </span>
                    <span className="text-text-main px-1 rounded font-bold">
                      {PRICE_MAP[r.tier]} Koin
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[0.6rem] mt-3 opacity-50 italic">
              * Harga di atas adalah harga jual waifu ke sistem.
            </p>
          </div>
        )}

        {msg && (
          <div className="mb-4 text-danger font-bold animate-pulse">{msg}</div>
        )}

        <div className="relative min-h-[300px] flex flex-col items-center justify-center mt-4">
          {isFetching ? (
            <div className="p-1 text-center">
              <p className="text-sm font-bold text-primary-blue">
                <i className="fa-solid fa-spinner fa-spin"></i> Menggacha...
              </p>
            </div>
          ) : !result ? (
            <button
              onClick={handleRoll}
              disabled={isRollDisabled}
              className={`btn-neo text-xl py-4 mt-4 w-full max-w-[250px] ${isRollDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRollDisabled ? `TUNGGU (${countdown}s)` : 'ROLL SEKARANG'}
            </button>
          ) : null}

          {result && !isFetching && (
            <div className="result-card w-full max-w-[280px] flex flex-col items-center animate-fade-in">
              <div className="card-neo p-4 text-center overflow-hidden">
                <h3 className="text-sm text-primary-blue mb-3 font-black uppercase">
                  Selamat! Kamu mendapatkan:
                </h3>
                <WaifuCard waifu={result} />
              </div>

              <div className="flex gap-2 w-full mt-6">
                <button
                  onClick={handleRoll}
                  disabled={isRollDisabled}
                  className={`btn-neo flex-1 text-sm ${isRollDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isRollDisabled ? `TUNGGU (${countdown}s)` : 'LAGI'}
                </button>
                <Link
                  to="/dashboard"
                  className="btn-neo btn-neo-secondary flex-1 text-sm no-underline text-center"
                >
                  INVENTORY
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
