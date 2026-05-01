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
      .select('id, created_at, waifu_pool(name, tier)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (data) setHistory(data);
    setLoading(false);
  };

  const getTierColor = (tier) => {
    switch (tier?.toUpperCase()) {
      case 'S': return 'bg-[#ffea00] text-black'; // Secondary Yellow
      case 'A': return 'bg-[#9333ea] text-white'; // Purple
      case 'B': return 'bg-[#3d5afe] text-white'; // Primary Blue
      case 'C': return 'bg-[#10b981] text-white'; // Emerald
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-md mx-auto pb-24">
        <h1 className="text-2xl font-black text-center mb-6 uppercase italic">
          Riwayat Gacha
        </h1>

        {loading ? (
          <div className="text-center font-bold animate-pulse text-text-muted">
            Memuat riwayat...
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="card-neo flex items-center justify-between p-2 px-4 bg-card-bg"
              >
                <div className="flex flex-col">
                  <div className="font-black text-sm uppercase tracking-tight">
                    {item.waifu_pool.name}
                  </div>
                  <div className="text-[0.65rem] font-bold text-text-muted">
                    {new Date(item.created_at).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div
                  className={`px-3 py-0.5 rounded-lg border-2 border-border-main font-black text-xs shadow-[2px_2px_0px_var(--border)] ${getTierColor(
                    item.waifu_pool.tier
                  )}`}
                >
                  {item.waifu_pool.tier}
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-10 opacity-50 font-bold border-2 border-dashed border-border-main rounded-2xl">
                Belum ada riwayat gacha.
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
