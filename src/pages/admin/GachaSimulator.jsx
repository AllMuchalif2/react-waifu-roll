import { useState, useRef, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import WaifuCard from '../../components/WaifuCard';
import { TIER_CONFIG } from '../../config/tierConfig';
import { playGachaSound, getFlashClassByTier, getBestTier } from '../../lib/gachaEffects';

const MOCK_WAIFUS = {
  C: { name: 'Mock Common', tier: 'C', image_url: 'https://placehold.co/400x400/adb5bd/white?text=Common' },
  B: { name: 'Mock Uncommon', tier: 'B', image_url: 'https://placehold.co/400x400/51cf66/white?text=Uncommon' },
  A: { name: 'Mock Rare', tier: 'A', image_url: 'https://placehold.co/400x400/339af0/white?text=Rare' },
  R: { name: 'Mock Rare+', tier: 'R', image_url: 'https://placehold.co/400x400/cc5de8/white?text=Rare+' },
  S: { name: 'Mock Special', tier: 'S', image_url: 'https://placehold.co/400x400/f06595/white?text=Special' },
  SR: { name: 'Mock Super Rare', tier: 'SR', image_url: 'https://placehold.co/400x400/ff922b/white?text=SR' },
  SSR: { name: 'Mock SSR', tier: 'SSR', image_url: 'https://placehold.co/400x400/fcc419/1a1a1a?text=SSR' },
  UR: { name: 'Mock Ultra Rare', tier: 'UR', image_url: 'https://placehold.co/400x400/ff6b6b/white?text=UR' },
  LIMITED: { name: 'Mock Limited', tier: 'LIMITED', image_url: 'https://placehold.co/400x400/ff6b6b/white?text=Limited' },
};

export default function GachaSimulator() {
  const [result, setResult] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [flashClass, setFlashClass] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const simulateRoll = (tier, count = 1) => {
    if (isFetching) return;

    setIsFetching(true);
    setResult(null);
    setFlashClass('');

    // Simulate delay
    setTimeout(() => {
      const results = [];
      if (count === 1) {
        results.push(MOCK_WAIFUS[tier]);
      } else {
        // 10x Simulation (Random tiers but highlighting the chosen one at least once)
        const tiers = ['C', 'B', 'A', 'R', 'S', 'SR', 'SSR', 'UR', 'LIMITED'];
        for (let i = 0; i < 9; i++) {
          const randTier = tiers[Math.floor(Math.random() * tiers.length)];
          results.push({ ...MOCK_WAIFUS[randTier], name: `Random ${randTier} #${i+1}` });
        }
        results.push({ ...MOCK_WAIFUS[tier], name: `Guaranteed ${tier}` });
      }

      setResult(count === 1 ? results[0] : results);
      setIsFetching(false);

      // Trigger effects based on highest tier
      const bestTier = getBestTier(results);
      setFlashClass(getFlashClassByTier(bestTier));
      playGachaSound(bestTier);

      // Clear flash after 2s
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setFlashClass('');
      }, 2000);
    }, 1000);
  };

  const isMultiple = Array.isArray(result);

  return (
    <>
      {flashClass && <div className={`screen-flash ${flashClass}`}></div>}
      <div className="min-h-screen">
      <Navbar />
      <main className="px-6 max-w-lg mx-auto pb-32 pt-6">
        <div className="card-neo bg-primary-blue text-white mb-8 py-4 shadow-[6px_6px_0px_#ffea00]">
          <h1 className="text-xl font-black text-center uppercase italic flex items-center justify-center gap-2">
            <i className="fa-solid fa-vial"></i>
            Gacha Simulator
          </h1>
          <p className="text-center text-[0.6rem] font-bold opacity-80 uppercase tracking-widest mt-1">
            Admin Only - Test Effects & Animations
          </p>
        </div>

        {/* CONTROLS */}
        <div className="card-neo mb-6 p-4">
          <h3 className="text-[0.65rem] font-black uppercase mb-3 text-primary-blue italic">Simulasi Per Tier (1X)</h3>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(TIER_CONFIG).map((tier) => {
              const config = TIER_CONFIG[tier];
              return (
                <button
                  key={tier}
                  onClick={() => simulateRoll(tier, 1)}
                  disabled={isFetching}
                  className={`p-2 border-2 border-border-main rounded-xl text-[0.6rem] font-black uppercase transition-all shadow-[3px_3px_0px_#1a1a1a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${config.color} ${config.textColor} ${isFetching ? 'opacity-50 grayscale' : 'hover:-translate-y-0.5'}`}
                >
                  {tier}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t-2 border-border-main/10">
            <button
              onClick={() => simulateRoll('SSR', 10)}
              disabled={isFetching}
              className="btn-neo btn-neo-secondary w-full py-3 text-xs"
            >
              <i className="fa-solid fa-layer-group mr-2"></i> SIMULASI 10X (Mix)
            </button>
          </div>
        </div>

        {/* PREVIEW AREA */}
        <div className={`relative min-h-[300px] flex flex-col items-center justify-center border-4 border-dashed border-border-main/20 rounded-3xl bg-card-bg/50 p-4`}>
          {isFetching ? (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-black text-primary-blue animate-pulse uppercase">Mengacak...</p>
            </div>
          ) : result ? (
            <div className={`w-full ${isMultiple ? 'max-w-md' : 'max-w-[280px]'} animate-zoom-in flex flex-col items-center`}>
              <div className="card-neo bg-white p-4 w-full">
                {isMultiple ? (
                   <div className="grid grid-cols-5 gap-1.5">
                    {result.map((waifu, idx) => {
                      const style = TIER_CONFIG[waifu.tier] || TIER_CONFIG.C;
                      const isHighTier = ['SSR', 'UR', 'LIMITED'].includes(waifu.tier);
                      return (
                        <div key={idx} className="relative group animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                          <div className={`border rounded-md overflow-hidden bg-white transition-transform hover:scale-105 shadow-[1px_1px_0px_#1a1a1a] ${isHighTier ? 'border-primary-blue' : 'border-border-main'}`}>
                            <img src={waifu.image_url} alt={waifu.name} className="w-full aspect-square object-cover" />
                            <div className={`absolute top-0 right-0 px-1 rounded-bl-md text-[0.55rem] font-black border-l border-b border-border-main ${style.color} ${style.textColor}`}>
                              {waifu.tier}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <WaifuCard waifu={result} />
                )}
                <div className="mt-4 pt-3 border-t-2 border-border-main text-center">
                   <span className="text-[0.65rem] font-black uppercase italic text-text-muted">Simulator Preview</span>
                </div>
              </div>
              <button 
                onClick={() => setResult(null)}
                className="btn-neo btn-neo-outline mt-4 py-2 px-6 text-xs w-auto"
              >
                CLEAR PREVIEW
              </button>
            </div>
          ) : (
            <div className="text-center text-text-muted opacity-50 px-10">
              <i className="fa-solid fa-wand-magic-sparkles text-4xl mb-4"></i>
              <p className="text-xs font-black uppercase italic">Pilih tier di atas untuk mensimulasikan animasi gacha</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
    </>
  );
}
