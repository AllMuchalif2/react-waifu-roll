import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function Rank() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();

    // Subscribe to real-time changes in profiles table
    const subscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchLeaders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchLeaders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('username, total_points, user_waifus(count)')
      .order('total_points', { ascending: false })
      .limit(10);

    if (data) {
      const formatted = data.map((item) => ({
        username: item.username,
        totalPoints: item.total_points || 0,
        waifuCount: item.user_waifus[0]?.count || 0,
      }));
      setLeaders(formatted);
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-md mx-auto pb-24 mt-4">
        <div className="card-neo bg-primary-blue text-white mb-6 py-4 shadow-[6px_6px_0px_#ffea00]">
          <h1 className="text-xl font-black text-center uppercase italic flex items-center justify-center gap-2">
            <i className="fa-solid fa-trophy text-secondary-yellow"></i>
            Top Players
          </h1>
        </div>

        {loading ? (
          <div className="text-center font-bold animate-pulse uppercase tracking-widest text-xs">
            Menghitung peringkat...
          </div>
        ) : (
          <div className="card-neo p-0 overflow-hidden border-2 border-text-dark shadow-[4px_4px_0px_#1a1a1a]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-text-dark text-text-main">
                <tr className="text-[0.65rem] uppercase tracking-wider font-black">
                  <th className="p-3">#</th>
                  <th className="p-3">User</th>
                  <th className="p-3 text-center">Waifu</th>
                  <th className="p-3 text-right">Poin</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((player, index) => (
                  <tr
                    key={index}
                    className="border-b-2 border-text-dark last:border-0 font-bold text-xs hover:bg-primary-blue/5 transition-colors"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 text-primary-blue truncate max-w-[80px]">
                      {player.username}
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-text-dark text-text-main px-2 py-0.5 rounded-full text-[0.6rem]">
                        {player.waifuCount}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <i className="fa-solid fa-star text-secondary-yellow text-[0.6rem]"></i>
                        {player.totalPoints.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
