import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import WaifuCard from '../../components/WaifuCard';
import { Link } from 'react-router-dom';

export default function AdminWaifus() {
  const [jikanId, setJikanId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [tier, setTier] = useState('C');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [waifuPool, setWaifuPool] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [dbSearch, setDbSearch] = useState('');
  const [dbTierFilter, setDbTierFilter] = useState('');

  useEffect(() => {
    fetchPool();
  }, []);

  const fetchPool = async () => {
    const { data } = await supabase
      .from('waifu_pool')
      .select('*')
      .order('id', { ascending: false });
    if (data) setWaifuPool(data);
  };

  // Filter data database di sisi client
  const filteredDbWaifus = waifuPool.filter((w) => {
    const matchName = w.name.toLowerCase().includes(dbSearch.toLowerCase());
    const matchTier = dbTierFilter ? w.tier === dbTierFilter : true;
    return matchName && matchTier;
  });

  // 1. Fetch data dari Jikan API berdasarkan ID
  const handleFetchJikan = async (e) => {
    e.preventDefault();
    if (!jikanId) return;

    setLoading(true);
    setMessage('');
    setSearchResults([]);
    try {
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
      setMessage('Gagal mengambil data dari Jikan API.');
    }
    setLoading(false);
  };

  // 2. Cari berdasarkan Nama
  const handleSearchName = async (e) => {
    e.preventDefault();
    if (!searchName) return;

    setLoading(true);
    setMessage('');
    setSearchResults([]);
    try {
      const res = await fetch(
        `https://api.jikan.moe/v4/characters?q=${searchName}&limit=15&order_by=favorites&sort=desc`,
      );
      const { data } = await res.json();

      if (data && data.length > 0) {
        setSearchResults(data);
      } else {
        setMessage('Karakter tidak ditemukan!');
      }
    } catch (error) {
      setMessage('Gagal mencari karakter.');
    }
    setLoading(false);
  };

  const selectCharacter = (char) => {
    setPreview({
      jikan_id: char.mal_id,
      name: char.name,
      image_url: char.images.webp.image_url,
      tier: tier,
    });
    setSearchResults([]);
    setSearchName('');
    setJikanId('');
  };

  // 3. Simpan ke Supabase
  const handleSave = async () => {
    if (!preview) return;
    setLoading(true);

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
      fetchPool();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus waifu ini dari pool?')) return;

    // Cek apakah waifu ini sudah dimiliki pemain (Data Integrity)
    const { count, error: checkError } = await supabase
      .from('user_waifus')
      .select('*', { count: 'exact', head: true })
      .eq('waifu_id', id);

    if (count > 0) {
      setMessage(
        'Gagal: Waifu ini sudah dimiliki oleh pemain! Hapus dulu data kepemilikan jika ingin menghapus dari pool.',
      );
      return;
    }

    const { error } = await supabase.from('waifu_pool').delete().eq('id', id);
    if (!error) {
      fetchPool();
      setMessage('Waifu berhasil dihapus.');
    } else {
      setMessage('Gagal menghapus: ' + error.message);
    }
  };

  const handleUpdateTier = async (id, newTier) => {
    const { error } = await supabase
      .from('waifu_pool')
      .update({ tier: newTier })
      .eq('id', id);
    if (!error) {
      setIsEditing(null);
      fetchPool();
      setMessage('Tier berhasil diupdate.');
    } else {
      setMessage('Gagal update: ' + error.message);
    }
  };

  // Update badge tier di preview jika pilihan dropdown diubah
  useEffect(() => {
    if (preview) setPreview((p) => ({ ...p, tier }));
  }, [tier]);

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-md mx-auto flex flex-col gap-6 pb-20 mt-4">
        <Link
          to="/admin"
          className="text-text-muted font-bold no-underline hover:text-primary-blue flex items-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i> Kembali ke Dasbor
        </Link>

        <div className="card-neo">
          <h1 className="text-xl mb-4 text-center font-black uppercase">
            Tambah Waifu Pool
          </h1>

          {message && (
            <div className="mb-4 p-3 bg-secondary-yellow text-text-dark text-center font-bold border-2 border-text-dark rounded-xl">
              {message}
            </div>
          )}

          {/* Cari Berdasarkan Nama */}
          <form onSubmit={handleSearchName} className="mb-6">
            <label className="font-extrabold text-sm">Cari Nama Karakter</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Contoh: Mikasa Ackerman"
                className="flex-1 p-3 border-2 border-text-dark rounded-xl outline-none focus:border-primary-blue font-sans font-medium"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-neo py-2 px-4"
              >
                <i className="fa-solid fa-search"></i>
              </button>
            </div>
          </form>

          {/* Hasil Pencarian Nama */}
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-2 mb-6 bg-gray-100 p-2 rounded-xl border-2 border-text-dark/10">
              <p className="text-[0.65rem] font-black uppercase opacity-50 px-1">
                Pilih Karakter:
              </p>
              {searchResults.map((char) => (
                <button
                  key={char.mal_id}
                  onClick={() => selectCharacter(char)}
                  className="flex items-center gap-3 p-2 bg-white border-2 border-text-dark rounded-lg hover:bg-primary-blue/10 transition-colors text-left"
                >
                  <img
                    src={char.images.webp.small_image_url}
                    className="w-10 h-10 rounded object-cover border border-text-dark"
                    alt=""
                  />
                  <div>
                    <div className="text-xs font-black leading-tight">
                      {char.name}
                    </div>
                    <div className="text-[0.6rem] opacity-60">
                      ID: {char.mal_id}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="relative h-px bg-text-dark/10 mb-6">
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[0.65rem] font-black opacity-30 italic">
              ATAU GUNAKAN ID
            </span>
          </div>

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
              {loading ? 'Mencari...' : 'Cek ID Jikan'}
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

        {/* List Kelola Waifu Pool */}
        <div className="card-neo">
          <h2 className="text-lg mb-4 font-black uppercase flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-primary-blue"></i>
            Database Pool ({filteredDbWaifus.length})
          </h2>

          {/* Filter & Search Database */}
          <div className="flex flex-col gap-2 mb-6">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs"></i>
              <input
                type="text"
                placeholder="Cari di database..."
                className="w-full pl-9 pr-3 py-2 border-2 border-text-dark rounded-xl outline-none focus:border-primary-blue text-xs font-bold"
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
              />
            </div>
            <select
              className="w-full p-2 border-2 border-text-dark rounded-xl outline-none text-xs font-bold bg-white"
              value={dbTierFilter}
              onChange={(e) => setDbTierFilter(e.target.value)}
            >
              <option value="">Semua Tier</option>
              <option value="C">Tier C</option>
              <option value="B">Tier B</option>
              <option value="A">Tier A</option>
              <option value="R">Tier R</option>
              <option value="S">Tier S</option>
              <option value="SR">Tier SR</option>
              <option value="SSR">Tier SSR</option>
              <option value="UR">Tier UR</option>
              <option value="LIMITED">LIMITED</option>
            </select>
          </div>

          <div className="flex flex-col gap-4">
            {filteredDbWaifus.map((waifu) => (
              <div
                key={waifu.id}
                className="flex items-center gap-3 p-2 bg-gray-50 border-2 border-text-dark/10 rounded-xl"
              >
                <img
                  src={waifu.image_url}
                  className="w-14 h-14 rounded-lg object-cover border-2 border-text-dark"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <div className="font-black text-xs truncate uppercase">
                    {waifu.name}
                  </div>
                  {isEditing === waifu.id ? (
                    <select
                      autoFocus
                      className="text-[0.65rem] font-bold border-b-2 border-primary-blue outline-none bg-transparent"
                      defaultValue={waifu.tier}
                      onChange={(e) => handleUpdateTier(waifu.id, e.target.value)}
                      onBlur={() => setIsEditing(null)}
                    >
                      <option value="C">Tier C</option>
                      <option value="B">Tier B</option>
                      <option value="A">Tier A</option>
                      <option value="R">Tier R</option>
                      <option value="S">Tier S</option>
                      <option value="SR">Tier SR</option>
                      <option value="SSR">Tier SSR</option>
                      <option value="UR">Tier UR</option>
                      <option value="LIMITED">LIMITED</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[0.6rem] font-black px-1.5 py-0.5 bg-primary-blue text-white rounded">
                        {waifu.tier}
                      </span>
                      <button
                        onClick={() => setIsEditing(waifu.id)}
                        className="text-[0.6rem] font-bold text-primary-blue hover:underline"
                      >
                        Edit Tier
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(waifu.id)}
                  className="w-8 h-8 flex items-center justify-center bg-danger/10 text-danger border-2 border-danger rounded-lg hover:bg-danger hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            ))}
            {filteredDbWaifus.length === 0 && (
              <p className="text-center text-xs opacity-50 italic">
                Data tidak ditemukan.
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
