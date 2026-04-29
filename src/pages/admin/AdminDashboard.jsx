import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminNavbar from '../../components/AdminNavbar';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalWaifus: 0,
    tierCounts: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    // 1. Hitung total pemain
    const { count: playersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 2. Ambil semua waifu untuk hitung total & per tier
    const { data: waifus } = await supabase.from('waifu_pool').select('tier');

    if (waifus) {
      const counts = waifus.reduce((acc, curr) => {
        acc[curr.tier] = (acc[curr.tier] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalPlayers: playersCount || 0,
        totalWaifus: waifus.length,
        tierCounts: counts,
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-light">
      <AdminNavbar />
      <main className="px-4 max-w-lg mx-auto pb-24">
        {/* Header Section */}
        <div className="card-neo mb-6 border-danger shadow-[6px_6px_0px_#ff1744]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center border-2 border-danger text-danger">
              <i className="fa-solid fa-user-shield text-2xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black uppercase text-text-dark">
                Admin Control
              </h1>
              <p className="text-[0.7rem] font-bold opacity-60">
                Dashboard Master & Statistik Sistem
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card-neo bg-primary-blue text-white p-4">
            <div className="text-3xl font-black mb-1">
              {loading ? '...' : stats.totalPlayers}
            </div>
            <div className="text-[0.6rem] font-bold uppercase tracking-wider opacity-80">
              Total Players
            </div>
          </div>
          <div className="card-neo bg-secondary-yellow text-text-dark p-4">
            <div className="text-3xl font-black mb-1">
              {loading ? '...' : stats.totalWaifus}
            </div>
            <div className="text-[0.6rem] font-bold uppercase tracking-wider opacity-80">
              Total Waifus
            </div>
          </div>
        </div>

        {/* Tier Stats */}
        <div className="card-neo mb-6">
          <h3 className="text-sm font-black mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-primary-blue"></i>
            DISTRIBUSI TIER
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {['LIMITED', 'UR', 'SSR', 'SR', 'S', 'R', 'A', 'B', 'C'].map(
              (tier) => (
                <div
                  key={tier}
                  className="bg-gray-100 p-2 rounded-lg border-2 border-text-dark/10 flex flex-col items-center"
                >
                  <span className="text-[0.6rem] font-black text-primary-blue">
                    {tier}
                  </span>
                  <span className="text-lg font-black text-text-dark">
                    {stats.tierCounts[tier] || 0}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          <Link
            to="/dashboard"
            className="text-center text-sm font-bold text-text-muted no-underline hover:text-primary-blue transition-colors"
          >
            &larr; Ke Dashboard Player
          </Link>
        </div>
      </main>
    </div>
  );
}
