import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminNavbar from '../../components/AdminNavbar';

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchSuggestions();
  }, [filter]);

  const fetchSuggestions = async () => {
    setLoading(true);
    let query = supabase
      .from('waifu_suggestions')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    if (data) setSuggestions(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (suggestion, newStatus) => {
    setLoading(true);

    if (newStatus === 'approved') {
      // 1. Masukkan ke waifu_pool
      const { error: poolError } = await supabase.from('waifu_pool').insert([
        {
          jikan_id: suggestion.jikan_id,
          name: suggestion.waifu_name,
          image_url: suggestion.image_url,
          tier: suggestion.suggested_tier,
        },
      ]);

      if (poolError) {
        alert('Gagal memasukkan ke pool: ' + poolError.message);
        setLoading(false);
        return;
      }

      // 2. Log Changelog
      await supabase.from('waifu_changelogs').insert([
        {
          action: 'ADD',
          waifu_name: suggestion.waifu_name,
          details: `Ditambahkan dari saran pemain (Tier: ${suggestion.suggested_tier})`,
        },
      ]);
    }

    // 3. Update status saran
    const { error } = await supabase
      .from('waifu_suggestions')
      .update({ status: newStatus })
      .eq('id', suggestion.id);

    if (error) {
      alert('Gagal mengupdate status: ' + error.message);
    } else {
      fetchSuggestions(); // Refresh data
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-light">
      <AdminNavbar />
      <main className="px-4 max-w-5xl mx-auto pb-20">
        <header className="mb-8">
          <h1 className="text-2xl font-black uppercase italic">
            Manajemen Saran Waifu
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Validasi masukan dari pemain untuk menambah waifu pool.
          </p>
        </header>

        {/* Filter Status */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl border-2 border-text-dark font-black text-[0.65rem] uppercase transition-all shadow-[3px_3px_0px_#1a1a1a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                filter === s
                  ? 'bg-secondary-yellow text-text-dark'
                  : 'bg-white text-text-muted'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 font-bold animate-pulse text-lg">
            Memuat saran...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="card-neo bg-white flex gap-4 animate-fade-in"
              >
                <img
                  src={s.image_url}
                  className="w-24 h-24 rounded-xl border-2 border-text-dark object-cover shadow-[4px_4px_0px_#1a1a1a]"
                  alt=""
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-black leading-tight">
                        {s.waifu_name}
                      </h3>
                      <span className="text-[0.6rem] bg-gray-100 px-2 py-1 rounded font-bold border border-text-dark/10">
                        {s.suggested_tier}
                      </span>
                    </div>
                    <p className="text-[0.65rem] text-text-muted mt-1 italic">
                      Disarankan oleh: <b>{s.profiles?.username || 'User'}</b>
                    </p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    {s.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(s, 'approved')}
                          className="flex-1 border-2 border-text-dark px-2 py-1 rounded-lg text-[0.6rem] font-black uppercase shadow-[2px_2px_0px_#1a1a1a]"
                        >
                          Terima
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(s, 'rejected')}
                          className="flex-1 bg-danger text-white border-2 border-text-dark px-2 py-1 rounded-lg text-[0.6rem] font-black uppercase shadow-[2px_2px_0px_#1a1a1a]"
                        >
                          Tolak
                        </button>
                      </>
                    )}
                    {s.status !== 'pending' && (
                      <div
                        className={`w-full text-center py-1 rounded-lg border-2 border-text-dark text-[0.6rem] font-black uppercase ${
                          s.status === 'approved' ? 'bg-success' : 'bg-danger'
                        } text-white`}
                      >
                        {s.status}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {suggestions.length === 0 && (
              <div className="col-span-full text-center py-20 text-text-muted italic opacity-50">
                Tidak ada saran dalam kategori ini.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
