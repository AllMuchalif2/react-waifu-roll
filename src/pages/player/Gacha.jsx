import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import WaifuCard from '../../components/WaifuCard';
import { animate as anime } from 'animejs';
import { DROP_RATES, PRICE_MAP } from '../../config/gachaConfig';

export default function Gacha() {
  const { user, profile, fetchProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState('');
  const [showRates, setShowRates] = useState(false);

  // Proteksi Halaman
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  // Referensi elemen untuk animasi Anime.js
  const boxRef = useRef(null);

  // Fungsi Logika RNG Gacha
  const getRandomTier = () => {
    const rand = Math.random() * 100;
    let cumulative = 0;
    for (const rate of DROP_RATES) {
      cumulative += rate.chance;
      if (rand <= cumulative) return rate.tier;
    }
    return 'C'; // Fallback
  };

  const handleRoll = async () => {
    if (profile.dice_count < 1) {
      setMsg('Dadu tidak cukup! Silakan klaim harian atau beli.');
      return;
    }

    setIsRolling(true);
    setResult(null);
    setMsg('');

    try {
      // 1. Kurangi dadu secara optimistik di UI & Database
      await supabase
        .from('profiles')
        .update({ dice_count: profile.dice_count - 1 })
        .eq('id', user.id);
      fetchProfile(user.id);

      // 2. Tentukan Tier Waifu (RNG)
      let selectedTier = getRandomTier();

      // 3. Ambil waifu sesuai tier (Include check kepemilikan untuk LIMITED)
      let { data: poolItems } = await supabase
        .from('waifu_pool')
        .select('*, user_waifus(id)')
        .eq('tier', selectedTier);

      // Filter: Jika LIMITED, buang yang sudah ada pemiliknya (1/1 Rule)
      if (selectedTier === 'LIMITED') {
        poolItems = poolItems.filter((item) => item.user_waifus.length === 0);
      }

      // SMART FALLBACK: Jika tier terpilih kosong (atau semua LIMITED sudah dimiliki)
      if (!poolItems || poolItems.length === 0) {
        const { data: allAvailable } = await supabase
          .from('waifu_pool')
          .select('*, user_waifus(id)');

        if (!allAvailable || allAvailable.length === 0) {
          throw new Error(
            'Maaf, mesin gacha sedang kosong! Admin belum menambahkan waifu apapun.',
          );
        }

        // Filter out owned LIMITED dari seluruh pool
        poolItems = allAvailable.filter((item) => {
          if (item.tier === 'LIMITED' && item.user_waifus.length > 0)
            return false;
          return true;
        });

        if (poolItems.length === 0) {
          throw new Error(
            'Wah! Semua waifu LIMITED sudah habis dimiliki pemain lain. Pool saat ini kosong.',
          );
        }
      }

      const randomWaifu =
        poolItems[Math.floor(Math.random() * poolItems.length)];

      // 4. Simpan ke Inventory Player
      await supabase.from('user_waifus').insert([
        {
          user_id: user.id,
          waifu_id: randomWaifu.id,
        },
      ]);

      // 5. Simpan ke Riwayat (Optional untuk Log)
      await supabase.from('gacha_history').insert([
        {
          user_id: user.id,
          waifu_id: randomWaifu.id,
        },
      ]);

      // 6. Jalankan Animasi Kotak Gacha (Anime.js)
      anime(boxRef.current, {
        scale: [1, 1.2, 0.8, 1.5, 0], // Membesar lalu mengecil hilang
        rotate: ['0deg', '15deg', '-15deg', '0deg', '360deg'], // Bergetar lalu berputar
        duration: 1500,
        easing: 'inOutQuad',
        onComplete: () => {
          setResult(randomWaifu);
          setIsRolling(false);
          // Putar suara jika dapat tier tinggi
          if (['SSR', 'UR', 'LIMITED'].includes(randomWaifu.tier)) {
            const audio = new Audio(
              'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
            );
            audio.volume = 0.5;
            audio.play().catch((e) => console.log('Audio play error:', e));
          }
        },
      });
    } catch (error) {
      setMsg(error.message);
      setIsRolling(false);
    }
  };

  // Efek munculnya kartu hasil (Fade In)
  useEffect(() => {
    if (result) {
      anime('.result-card', {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: 'outExpo',
      });
    }
  }, [result]);

  if (!profile) return null;

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-md mx-auto text-center pb-24">
        <div className="flex justify-center gap-2 mb-8">
          <div className="inline-flex items-center gap-2 bg-text-dark text-white px-4 py-2 rounded-xl font-bold border-2 border-primary-blue shadow-[4px_4px_0px_#ffea00]">
            <i className="fa-solid fa-dice"></i> Dadu: {profile.dice_count}
          </div>
          <button
            onClick={() => setShowRates(!showRates)}
            className="w-10 h-10 bg-white border-2 border-text-dark rounded-xl flex items-center justify-center shadow-[4px_4px_0px_#1a1a1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            title="Info Rate"
          >
            <i className="fa-solid fa-circle-info text-primary-blue"></i>
          </button>
        </div>

        {/* Modal/Overlay Rate Info */}
        {showRates && (
          <div className="card-neo mb-6 bg-white text-left animate-fade-in relative">
            <button
              onClick={() => setShowRates(false)}
              className="absolute top-2 right-2 text-text-muted hover:text-danger"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <h3 className="text-sm font-black mb-3 border-b-2 border-text-dark pb-1 uppercase italic">
              Gacha Rates & Prices
            </h3>
            <div className="flex flex-col gap-1">
              {DROP_RATES.map((r) => (
                <div key={r.tier} className="flex justify-between text-[0.7rem]">
                  <span className="font-bold">
                    {r.label || r.tier} ({r.tier})
                  </span>
                  <div className="flex gap-3">
                    <span className="text-primary-blue font-black">
                      {r.chance}%
                    </span>
                    <span className="text-secondary-yellow bg-text-dark px-1 rounded font-bold">
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
          {/* STATE 1: Kotak Misteri / Animasi Roll */}
          {!result && (
            <div
              ref={boxRef}
              className="w-32 h-32 bg-secondary-yellow border-4 border-text-dark rounded-2xl flex items-center justify-center shadow-[8px_8px_0px_#1a1a1a] mb-8"
            >
              <i className="fa-solid fa-question text-6xl text-text-dark"></i>
            </div>
          )}

          {/* Tombol Roll (Sembunyi saat animasi) */}
          {!isRolling && !result && (
            <button onClick={handleRoll} className="btn-neo text-xl py-4 mt-4">
              ROLL SEKARANG
            </button>
          )}

          {/* STATE 2: Hasil Waifu Muncul */}
          {result && (
            <div className="result-card opacity-0 w-full max-w-[280px] flex flex-col items-center">
              <h2 className="text-xl font-black mb-4 text-primary-blue drop-shadow-md">
                KAMU MENDAPATKAN:
              </h2>
              <WaifuCard waifu={result} />

              <div className="flex gap-2 w-full mt-6">
                <button
                  onClick={() => setResult(null)}
                  className="btn-neo flex-1 text-sm"
                >
                  LAGI
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
