import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import WaifuCard from '../../components/WaifuCard';
import { supabase } from '../../lib/supabase';

export default function Waifus() {
  const [waifus, setWaifus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  useEffect(() => {
    fetchWaifus();
  }, []);

  const fetchWaifus = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('waifu_pool')
      .select('*, user_waifus(profiles(username))');

    if (!error && data) {
      let formatted = data.map((w) => ({
        ...w,
        owner: w.user_waifus?.[0]?.profiles?.username || null,
      }));

      const tierRank = {
        LIMITED: 1,
        UR: 2,
        SSR: 3,
        SR: 4,
        S: 5,
        A: 6,
        B: 7,
        C: 8,
      };

      formatted.sort((a, b) => {
        const rankA = tierRank[a.tier?.toUpperCase()] || 99;
        const rankB = tierRank[b.tier?.toUpperCase()] || 99;
        return rankA - rankB;
      });

      setWaifus(formatted);
    }

    setLoading(false);
  };

  const filteredWaifus = waifus.filter((w) => {
    const matchName = w.name.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter ? w.tier === tierFilter : true;
    return matchName && matchTier;
  });

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-3xl mx-auto">
        <div className="card-neo mb-6 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl">Daftar Waifu Pool</h2>
            <Link
              to="/changelog"
              className="text-[0.65rem] font-black uppercase text-primary-blue bg-primary-blue/10 px-2 py-1 rounded-md border border-primary-blue/20 no-underline"
            >
              <i className="fa-solid fa-clock-rotate-left mr-1"></i> Changelog
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
              <input
                type="text"
                placeholder="Cari waifu..."
                className="w-full pl-10 pr-4 py-3 border-2 border-border-main rounded-xl outline-none focus:border-primary-blue transition-colors font-sans font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="p-3 border-2 border-border-main rounded-xl outline-none font-sans font-bold cursor-pointer"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
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
        </div>

        {loading ? (
          <div className="text-center font-bold animate-pulse text-xl mt-10">
            <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Memuat
            Data...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredWaifus.map((waifu) => (
              <WaifuCard key={waifu.id} waifu={waifu} />
            ))}
            {filteredWaifus.length === 0 && (
              <div className="col-span-full text-center text-text-muted mt-8 font-semibold">
                Wah, waifu tidak ditemukan di pool.
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
