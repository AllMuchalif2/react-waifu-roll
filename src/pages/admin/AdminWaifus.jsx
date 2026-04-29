import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import WaifuCard from '../../components/WaifuCard';
import { Link } from 'react-router-dom';

export default function AdminWaifus() {
  const [jikanId, setJikanId] = useState('');
  const [tier, setTier] = useState('C');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. Fetch data dari Jikan API
  const handleFetchJikan = async (e) => {
    e.preventDefault();
    if (!jikanId) return;

    setLoading(true);
    setMessage('');
    try {
      // Mengambil data karakter dari MyAnimeList
      const res = await fetch(`https://api.jikan.moe/v4/characters/${jikanId}`);
      const { data } = await res.json();

      if (data) {
        setPreview({
          jikan_id: data.mal_id,
          name: data.name,
          image_url: data.images.webp.image_url,
          tier: tier,
        });
      } else {
        setMessage('Karakter tidak ditemukan!');
      }
    } catch (error) {
      setMessage('Gagal mengambil data dari Jikan API. Pastikan ID benar.');
    }
    setLoading(false);
  };

  // 2. Simpan ke Supabase
  const handleSave = async () => {
    if (!preview) return;
    setLoading(true);

    // PERBAIKAN: Gunakan .maybeSingle() agar tidak error 406 jika waifu belum ada
    const { data: existing } = await supabase
      .from('waifu_pool')
      .select('id')
      .eq('jikan_id', preview.jikan_id)
      .maybeSingle();

    if (existing) {
      setMessage('Waifu ini sudah ada di dalam Pool!');
      setLoading(false);
      return;
    }

    // Insert ke tabel waifu_pool
    const { error } = await supabase.from('waifu_pool').insert([
      {
        jikan_id: preview.jikan_id,
        name: preview.name,
        image_url: preview.image_url,
        tier: preview.tier,
      },
    ]);

    if (error) {
      setMessage('Gagal menyimpan: ' + error.message);
    } else {
      setMessage(`Berhasil! ${preview.name} ditambahkan ke Pool.`);
      setPreview(null);
      setJikanId('');
    }
    setLoading(false);
  };

  // Update badge tier di preview jika pilihan dropdown diubah
  useEffect(() => {
    if (preview) setPreview((p) => ({ ...p, tier }));
  }, [tier]);

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-md mx-auto flex flex-col gap-6 pb-20">
        <Link
          to="/admin"
          className="text-text-muted font-bold no-underline hover:text-primary-blue"
        >
          &larr; Kembali ke Dasbor
        </Link>

        <div className="card-neo">
          <h1 className="text-xl mb-4 text-center">Tambah Waifu Pool</h1>

          {message && (
            <div className="mb-4 p-3 bg-secondary-yellow text-text-dark text-center font-bold border-2 border-text-dark rounded-xl">
              {message}
            </div>
          )}

          <form onSubmit={handleFetchJikan} className="flex flex-col gap-4">
            <div>
              <label className="font-extrabold text-sm">
                Jikan Character ID
              </label>
              <input
                type="number"
                value={jikanId}
                onChange={(e) => setJikanId(e.target.value)}
                placeholder="Contoh ID: 118744"
                className="w-full p-3 border-2 border-text-dark rounded-xl mt-1 outline-none focus:border-primary-blue font-sans font-medium"
              />
              <p className="text-xs text-text-muted mt-1">
                Dapatkan ID karakter dari URL MyAnimeList.
              </p>
            </div>

            <div>
              <label className="font-extrabold text-sm">Tentukan Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full p-3 border-2 border-text-dark rounded-xl mt-1 outline-none font-sans font-bold bg-white cursor-pointer"
              >
                <option value="C">Tier C (Common)</option>
                <option value="B">Tier B (Uncommon)</option>
                <option value="A">Tier A (Rare)</option>
                <option value="R">Tier R (Epic)</option>
                <option value="S">Tier S (Legendary)</option>
                <option value="SR">Tier SR (Mythic)</option>
                <option value="SSR">Tier SSR (Celestial)</option>
                <option value="UR">Tier UR (Ultimate)</option>
                <option value="LIMITED">LIMITED (1/1)</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-neo mt-2">
              <i className="fa-solid fa-magnifying-glass"></i>{' '}
              {loading ? 'Mencari...' : 'Cari di Jikan'}
            </button>
          </form>
        </div>

        {/* Area Preview Waifu Card */}
        {preview && (
          <div className="card-neo bg-bg-light border-dashed flex flex-col items-center">
            <h2 className="text-lg mb-4 font-black text-center">
              Preview Kartu
            </h2>
            <div className="w-[180px]">
              {/* Gunakan komponen WaifuCard yang sudah kita buat di Step 6 */}
              <WaifuCard waifu={preview} />
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-neo btn-neo-danger mt-6 w-full"
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>{' '}
              {loading ? 'Menyimpan...' : 'SIMPAN KE POOL'}
            </button>
          </div>
        )}
      </main>
    </>
  );
}
