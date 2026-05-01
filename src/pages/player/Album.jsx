import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import { TIER_CONFIG } from '../../config/tierConfig';

export default function Album() {
  const { user } = useAuth();
  const [allWaifus, setAllWaifus] = useState([]);
  const [userWaifuIds, setUserWaifuIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all available waifus
      const { data: pool } = await supabase
        .from('waifu_pool')
        .select('*');
      
      // 2. Fetch user's current collection ids
      const { data: collection } = await supabase
        .from('user_waifus')
        .select('waifu_id')
        .eq('user_id', user.id);

      if (pool) {
         // Sort by tier order
         const tiersOrder = ['LIMITED', 'UR', 'SSR', 'SR', 'S', 'R', 'A', 'B', 'C'];
         const sorted = pool.sort((a, b) => tiersOrder.indexOf(a.tier) - tiersOrder.indexOf(b.tier));
         setAllWaifus(sorted);
      }
      
      if (collection) {
        setUserWaifuIds(new Set(collection.map(c => c.waifu_id)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = allWaifus.filter(w => !filter || w.tier === filter);
  const collectedCount = allWaifus.filter(w => userWaifuIds.has(w.id)).length;

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-lg mx-auto pb-24 mt-4">
        {/* Header Stats */}
        <div className="card-neo bg-primary-blue text-white mb-6 p-4 flex justify-between items-center shadow-[6px_6px_0px_#ffea00]">
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Waifu Album</h1>
            <p className="text-[0.6rem] font-bold opacity-80 uppercase tracking-widest">Koleksi Terkumpul</p>
          </div>
          <div className="text-right">
             <span className="text-3xl font-black">{collectedCount}</span>
             <span className="text-sm opacity-60">/{allWaifus.length}</span>
          </div>
        </div>

        {/* Tier Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
           <button 
             onClick={() => setFilter('')}
             className={`px-4 py-1.5 rounded-full border-2 border-text-dark text-[0.6rem] font-black uppercase whitespace-nowrap transition-all ${!filter ? 'bg-secondary-yellow shadow-[2px_2px_0px_#1a1a1a]' : 'bg-white'}`}
           >
             ALL
           </button>
           {Object.keys(TIER_CONFIG).map(tier => (
             <button 
                key={tier}
                onClick={() => setFilter(tier)}
                className={`px-4 py-1.5 rounded-full border-2 border-text-dark text-[0.6rem] font-black uppercase whitespace-nowrap transition-all ${filter === tier ? `${TIER_CONFIG[tier].color} ${TIER_CONFIG[tier].textColor} shadow-[2px_2px_0px_#1a1a1a]` : 'bg-white'}`}
             >
               {tier}
             </button>
           ))}
        </div>

        {loading ? (
          <div className="text-center py-20 animate-pulse font-black uppercase text-xs">Membuka Album...</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
            {filtered.map((waifu) => {
              const isCollected = userWaifuIds.has(waifu.id);
              const style = TIER_CONFIG[waifu.tier];
              
              return (
                <div key={waifu.id} className="relative group">
                  <div className={`card-neo p-0 overflow-hidden border-2 transition-all ${isCollected ? 'border-text-dark shadow-[3px_3px_0px_#1a1a1a]' : 'border-dashed border-text-dark/20 shadow-none'}`}>
                    <div className="relative aspect-square">
                      <img 
                        src={waifu.image_url} 
                        alt={waifu.name} 
                        className={`w-full h-full object-cover transition-all duration-500 ${isCollected ? 'grayscale-0' : 'grayscale brightness-0 opacity-20'}`}
                      />
                      {isCollected && (
                        <div className={`absolute top-0 right-0 px-1.5 py-0.5 rounded-bl-lg text-[0.5rem] font-black border-l border-b border-text-dark ${style.color} ${style.textColor}`}>
                          {waifu.tier}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className={`mt-2 text-[0.55rem] font-black uppercase text-center truncate px-1 ${isCollected ? 'text-text-dark' : 'text-text-muted opacity-30'}`}>
                    {isCollected ? waifu.name : '??????'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
