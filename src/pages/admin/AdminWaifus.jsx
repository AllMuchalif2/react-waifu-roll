import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminNavbar from '../../components/AdminNavbar';
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

  const filteredDbWaifus = waifuPool.filter((w) => {
    const matchName = w.name.toLowerCase().includes(dbSearch.toLowerCase());
    const matchTier = dbTierFilter ? w.tier === dbTierFilter : true;
    return matchName && matchTier;
  });

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
      await supabase.from('waifu_changelogs').insert([
        {
          action: 'ADD',
          waifu_name: preview.name,
          details: `Ditambahkan ke pool dengan Tier ${preview.tier}`,
        },
      ]);

      setMessage(`Berhasil! ${preview.name} ditambahkan ke Pool.`);
      setPreview(null);
      setJikanId('');
      fetchPool();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus waifu ini dari pool?')) return;

    const { count } = await supabase
      .from('user_waifus')
      .select('*', { count: 'exact', head: true })
      .eq('waifu_id', id);

    if (count > 0) {
      setMessage(
        'Gagal: Waifu ini sudah dimiliki oleh pemain! Hapus dulu data kepemilikan jika ingin menghapus dari pool.',
      );
      return;
    }

    const { data: oldData } = await supabase
      .from('waifu_pool')
      .select('name')
      .eq('id', id)
      .single();

    const { error } = await supabase.from('waifu_pool').delete().eq('id', id);
    if (!error) {
      await supabase.from('waifu_changelogs').insert([
        {
          action: 'DELETE',
          waifu_name: oldData?.name || 'Unknown',
          details: `Dihapus dari pool oleh Admin`,
        },
      ]);

      fetchPool();
      setMessage('Waifu berhasil dihapus.');
    } else {
      setMessage('Gagal menghapus: ' + error.message);
    }
  };

  const handleUpdateTier = async (id, newTier) => {
    const { data: oldData } = await supabase
      .from('waifu_pool')
      .select('name, tier')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('waifu_pool')
      .update({ tier: newTier })
      .eq('id', id);

    if (!error) {
      await supabase.from('waifu_changelogs').insert([
        {
          action: 'UPDATE',
          waifu_name: oldData?.name || 'Unknown',
          details: `Tier diubah dari ${oldData?.tier} ke ${newTier}`,
        },
      ]);

      setIsEditing(null);
      fetchPool();
      setMessage('Tier berhasil diupdate.');
    } else {
      setMessage('Gagal update: ' + error.message);
    }
  };

  useEffect(() => {
    if (preview) setPreview((p) => ({ ...p, tier }));
  }, [tier]);

  return (
    <div className="min-h-screen bg-bg-main">
      <AdminNavbar />
      <main className="px-4 max-w-md mx-auto flex flex-col gap-6 pb-20 mt-4 transition-colors duration-300">
        <div className="card-neo bg-card-bg">
          <h1 className="text-xl mb-4 text-center font-black uppercase text-text-main">
            Tambah Waifu Pool
          </h1>

          {message && (
            <div className="mb-4 p-3 bg-secondary-yellow text-[#1a1a1a] text-center font-bold border-2 border-border-main rounded-xl">
              {message}
            </div>
          )}

          <form onSubmit={handleSearchName} className="mb-6 text-text-main">
            <label className="font-extrabold text-sm">Cari Nama Karakter</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Contoh: Mikasa Ackerman"
                className="flex-1 p-3 border-2 border-border-main bg-bg-main rounded-xl outline-none focus:border-primary-blue font-sans font-medium"
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

          {searchResults.length > 0 && (
            <div className="flex flex-col gap-2 mb-6 bg-bg-main p-2 rounded-xl border-2 border-border-main/10">
              <p className="text-[0.65rem] font-black uppercase opacity-50 px-1 text-text-main">
                Pilih Karakter:
              </p>
              {searchResults.map((char) => (
                <button
                  key={char.mal_id}
                  onClick={() => selectCharacter(char)}
                  className="flex items-center gap-3 p-2 bg-card-bg border-2 border-border-main rounded-lg hover:bg-primary-blue/10 transition-colors text-left"
                >
                  <img
                    src={char.images.webp.small_image_url}
                    className="w-10 h-10 rounded object-cover border border-border-main"
                    alt=""
                  />
                  <div>
                    <div className="text-xs font-black leading-tight text-text-main">
                      {char.name}
                    </div>
                    <div className="text-[0.6rem] opacity-60 text-text-main">
                      ID: {char.mal_id}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="relative h-px bg-border-main/10 mb-6">
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card-bg px-2 text-[0.65rem] font-black opacity-30 italic text-text-main">
              ATAU GUNAKAN ID
            </span>
          </div>

          <form onSubmit={handleFetchJikan} className="flex flex-col gap-4 text-text-main">
            <div>
              <label className="font-extrabold text-sm">
                Jikan Character ID
              </label>
              <input
                type="number"
                value={jikanId}
                onChange={(e) => setJikanId(e.target.value)}
                placeholder="Contoh ID: 118744"
                className="w-full p-3 border-2 border-border-main bg-bg-main rounded-xl mt-1 outline-none focus:border-primary-blue font-sans font-medium"
              />
            </div>

            <div>
              <label className="font-extrabold text-sm">Tentukan Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full p-3 border-2 border-border-main rounded-xl mt-1 outline-none font-sans font-bold bg-bg-main cursor-pointer"
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

        {preview && (
          <div className="card-neo bg-bg-main border-dashed flex flex-col items-center border-primary-blue">
            <h2 className="text-lg mb-4 font-black text-center text-text-main">
              Preview Kartu
            </h2>
            <div className="w-[180px]">
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

        <div className="card-neo bg-card-bg">
          <h2 className="text-lg mb-4 font-black uppercase flex items-center gap-2 text-text-main">
            <i className="fa-solid fa-layer-group text-primary-blue"></i>
            Database Pool ({filteredDbWaifus.length})
          </h2>

          <div className="flex flex-col gap-2 mb-6">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs"></i>
              <input
                type="text"
                placeholder="Cari di database..."
                className="w-full pl-9 pr-3 py-2 border-2 border-border-main bg-bg-main rounded-xl outline-none focus:border-primary-blue text-xs font-bold text-text-main"
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
              />
            </div>
            <select
              className="w-full p-2 border-2 border-border-main rounded-xl outline-none text-xs font-bold bg-bg-main text-text-main"
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
                className="flex items-center gap-3 p-2 bg-bg-main border-2 border-border-main/10 rounded-xl"
              >
                <img
                  src={waifu.image_url}
                  className="w-14 h-14 rounded-lg object-cover border-2 border-border-main"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <div className="font-black text-xs truncate uppercase text-text-main">
                    {waifu.name}
                  </div>
                  {isEditing === waifu.id ? (
                    <select
                      autoFocus
                      className="text-[0.65rem] font-bold border-b-2 border-primary-blue outline-none bg-transparent text-text-main"
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
              <p className="text-center text-xs opacity-50 italic text-text-main">
                Data tidak ditemukan.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
