import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Suggestions() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [suggestedTier, setSuggestedTier] = useState('C');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [mySuggestions, setMySuggestions] = useState([]);

  useEffect(() => {
    if (!user) navigate('/login');
    else fetchMySuggestions();
  }, [user]);

  const fetchMySuggestions = async () => {
    const { data } = await supabase
      .from('waifu_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setMySuggestions(data);
  };

  const handleSearch = async () => {
    if (!searchName || searchName.length < 3) return;
    setLoading(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `https://api.jikan.moe/v4/characters?q=${searchName}&limit=5&order_by=favorites&sort=desc`,
      );
      const { data } = await res.json();
      if (data) setSearchResults(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChar) {
      setMsg({ type: 'error', text: 'Pilih karakter dulu dari pencarian!' });
      return;
    }

    setLoading(true);
    setMsg({ type: '', text: '' });

    const { error } = await supabase.from('waifu_suggestions').insert([
      {
        user_id: user.id,
        waifu_name: selectedChar.name,
        jikan_id: selectedChar.mal_id,
        image_url: selectedChar.images.webp.image_url,
        suggested_tier: suggestedTier,
        status: 'pending',
      },
    ]);

    if (!error) {
      setMsg({
        type: 'success',
        text: 'Saran berhasil dikirim! Admin akan mengeceknya.',
      });
      setSelectedChar(null);
      setSearchName('');
      setSearchResults([]);
      fetchMySuggestions();
    } else {
      setMsg({ type: 'error', text: 'Gagal mengirim saran: ' + error.message });
    }
    setLoading(false);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-primary-blue text-white font-black border-text-dark';
      case 'rejected':
        return 'bg-danger text-white font-black border-text-dark';
      default:
        return 'bg-secondary-yellow text-text-dark border-text-dark';
    }
  };

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-xl mx-auto pb-24">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-black italic uppercase">Saran Waifu</h1>
          <p className="text-text-muted text-sm mt-2 text-balance">
            Cari waifu dari Jikan API dan pilih tier yang menurutmu cocok!
          </p>
        </header>

        <div className="card-neo bg-card-bg mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {msg.text && (
              <div
                className={`p-3 rounded-xl border-2 border-border-main font-bold text-sm text-center ${msg.type === 'success' ? 'bg-primary-blue/20 text-text-main' : 'bg-danger/20 text-danger'}`}
              >
                {msg.text}
              </div>
            )}

            {!selectedChar ? (
              <div className="flex flex-col gap-2">
                <label className="font-extrabold text-sm uppercase">
                  Cari Nama Waifu
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Contoh: Kurumi Tokisaki"
                    className="flex-1 p-3 border-2 border-text-dark rounded-xl mt-1 outline-none focus:border-primary-blue font-sans font-medium text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={loading}
                    className="btn-neo w-max px-4 mt-1"
                  >
                    {loading ? (
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-magnifying-glass"></i>
                    )}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2 bg-bg-main p-2 rounded-xl border-2 border-border-main max-h-48 overflow-y-auto">
                    {searchResults.map((char) => (
                      <button
                        key={char.mal_id}
                        type="button"
                        onClick={() => setSelectedChar(char)}
                        className="flex items-center gap-3 p-2 hover:bg-primary-blue/20 rounded-lg transition-colors text-left border border-transparent hover:border-border-main"
                      >
                        <img
                          src={char.images.webp.small_image_url}
                          className="w-10 h-10 rounded object-cover border border-border-main"
                          alt=""
                        />
                        <div className="text-[0.7rem] font-black text-text-main">
                          {char.name}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="card-neo bg-card-bg p-4 rounded-2xl border-2 border-dashed border-primary-blue flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedChar.images.webp.image_url}
                    className="w-16 h-16 rounded-xl border-2 border-border-main object-cover"
                    alt=""
                  />
                  <div>
                    <div className="text-text-main text-sm font-bold">
                      {selectedChar.name}
                    </div>
                    <div className="text-text-main text-[0.6rem] opacity-50">
                      ID: {selectedChar.mal_id}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedChar(null)}
                  className="text-danger hover:scale-110 transition-transform"
                >
                  <i className="fa-solid fa-circle-xmark text-xl"></i>
                </button>
              </div>
            )}

            <div>
              <label className="font-extrabold text-sm uppercase">
                Saran Tier
              </label>
              <select
                value={suggestedTier}
                onChange={(e) => setSuggestedTier(e.target.value)}
                className="w-full p-3 border-2 border-border-main rounded-xl mt-1 outline-none font-sans font-bold bg-card-bg cursor-pointer"
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

            <button
              type="submit"
              disabled={loading || !selectedChar}
              className="btn-neo mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : (
                <i className="fa-solid fa-paper-plane"></i>
              )}
              KIRIM SARAN
            </button>
          </form>
        </div>

        {/* Daftar Saran Saya */}
        <h3 className="text-sm font-black mb-4 border-b-2 border-border-main pb-1 uppercase italic inline-block">
          Riwayat Saran Anda
        </h3>

        <div className="flex flex-col gap-3">
          {mySuggestions.map((s) => (
            <div
              key={s.id}
              className="card-neo bg-card-bg p-4 flex flex-col gap-3 relative"
            >
              <div className="flex items-center gap-4">
                <img
                  src={s.image_url}
                  className="w-12 h-12 rounded-lg border-2 border-border-main object-cover"
                  alt=""
                />
                <div className="flex-1">
                  <div className="text-text-main font-bold leading-tight">
                    {s.waifu_name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[0.6rem] border-2 uppercase ${getStatusStyle(s.status)}`}
                    >
                      {s.status}
                    </span>
                    <span className="bg-border-main text-card-bg px-2 py-0.5 rounded text-[0.6rem] font-bold">
                      Tier {s.suggested_tier}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {mySuggestions.length === 0 && (
            <div className="text-center py-10 text-text-muted italic opacity-50 text-xs">
              Belum ada saran yang dikirim.
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
