import { useState, useEffect } from 'react';
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
      .select('*')
      .order('id', { ascending: false });

    if (!error && data) {
      setWaifus(data);
    }
    setLoading(false);
  };

  // Menggunakan pendekatan derived state agar pencarian sangat responsif tanpa hit API berulang
  const filteredWaifus = waifus.filter((w) => {
    const matchName = w.name.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter ? w.tier === tierFilter : true;
    return matchName && matchTier;
  });

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-3xl mx-auto">
        {/* Panel Filter */}
        <div className="card-neo mb-6 p-4">
          <h2 className="text-xl mb-4 text-center">Daftar Waifu Pool</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
              <input
                type="text"
                placeholder="Cari waifu..."
                className="w-full pl-10 pr-4 py-3 border-2 border-text-dark rounded-xl outline-none focus:border-primary-blue transition-colors font-sans font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="p-3 border-2 border-text-dark rounded-xl outline-none font-sans font-bold bg-white cursor-pointer"
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

        {/* Grid Waifu */}
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
