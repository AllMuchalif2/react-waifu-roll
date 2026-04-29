import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import WaifuCard from '../../components/WaifuCard';
import { animate as anime } from 'animejs';

// Konfigurasi Drop Rate (%)
const DROP_RATES = [
  { tier: 'LIMITED', chance: 0.01 },
  { tier: 'UR', chance: 0.19 },
  { tier: 'SSR', chance: 0.8 },
  { tier: 'SR', chance: 2.0 },
  { tier: 'S', chance: 4.0 },
  { tier: 'R', chance: 8.0 },
  { tier: 'A', chance: 15.0 },
  { tier: 'B', chance: 30.0 },
  { tier: 'C', chance: 40.0 },
];

export default function Gacha() {
  const { user, profile, fetchProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState('');

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
      const tier = getRandomTier();

      // 3. Ambil 1 waifu acak dari pool sesuai Tier tersebut
      const { data: poolItems } = await supabase
        .from('waifu_pool')
        .select('*')
        .eq('tier', tier);

      if (!poolItems || poolItems.length === 0) {
        throw new Error(`Maaf, Pool untuk Tier ${tier} sedang kosong.`);
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
        {/* Info Sisa Dadu */}
        <div className="inline-flex items-center gap-2 bg-text-dark text-white px-4 py-2 rounded-xl font-bold mb-8 border-2 border-primary-blue shadow-[4px_4px_0px_#ffea00]">
          <i className="fa-solid fa-dice"></i> Dadu: {profile.dice_count}
        </div>

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
