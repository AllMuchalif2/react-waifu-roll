import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Proteksi Halaman
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('gacha_history')
      .select('id, created_at, waifu_pool(name, tier, image_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setHistory(data);
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-md mx-auto pb-24">
        <h1 className="text-2xl font-black text-center mb-6">Riwayat Gacha</h1>

        {loading ? (
          <div className="text-center font-bold">Memuat riwayat...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="card-neo flex items-center gap-4 p-3 bg-white"
              >
                <img
                  src={item.waifu_pool.image_url}
                  className="w-16 h-16 rounded-lg border-2 border-text-dark object-cover"
                  alt={item.waifu_pool.name}
                />
                <div className="flex-1">
                  <div className="font-black text-sm uppercase">
                    {item.waifu_pool.name}
                  </div>
                  <div className="text-[0.7rem] font-bold opacity-60">
                    Tier: {item.waifu_pool.tier}
                  </div>
                  <div className="text-[0.6rem] text-text-muted mt-1">
                    {new Date(item.created_at).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-center opacity-50">Belum ada riwayat gacha.</p>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
