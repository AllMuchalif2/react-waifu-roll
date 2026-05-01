import { Link } from 'react-router-dom';
import WaifuCard from '../WaifuCard';

export default function GachaRollArea({ 
  isFetching, 
  result, 
  isRollDisabled, 
  countdown, 
  onRoll 
}) {
  const isMultiple = Array.isArray(result);

  return (
    <div className="relative min-h-[300px] flex flex-col items-center justify-center mt-4">
      {isFetching ? (
        <div className="p-1 text-center">
          <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-black text-primary-blue animate-pulse uppercase italic">
            Sedang Menggacha...
          </p>
        </div>
      ) : !result ? (
        <div className="flex flex-col gap-3 w-full max-w-[280px]">
          <button
            onClick={() => onRoll(1)}
            disabled={isRollDisabled}
            className={`btn-neo text-xl py-4 ${isRollDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRollDisabled ? `TUNGGU (${countdown}s)` : 'ROLL 1X'}
          </button>
          <button
            onClick={() => onRoll(10)}
            disabled={isRollDisabled}
            className={`btn-neo btn-neo-secondary text-xl py-4 ${isRollDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRollDisabled ? `TUNGGU (${countdown}s)` : 'ROLL 10X'}
          </button>
        </div>
      ) : null}

      {result && !isFetching && (
        <div className={`result-card w-full ${isMultiple ? 'max-w-md' : 'max-w-[280px]'} flex flex-col items-center animate-zoom-in`}>
          <div className="card-neo p-4 text-center w-full overflow-hidden">
            <h3 className="text-sm text-primary-blue mb-3 font-black uppercase italic border-b-2 border-border-main pb-2">
              Selamat! Kamu mendapatkan:
            </h3>
            
            {isMultiple ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {result.map((waifu, idx) => (
                  <div key={idx} className="relative group animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="border-2 border-border-main rounded-lg overflow-hidden bg-white shadow-[2px_2px_0px_var(--border)]">
                      <img src={waifu.image_url} alt={waifu.name} className="w-full aspect-square object-cover" />
                      <div className={`absolute top-0 right-0 px-1 rounded-bl-lg text-[0.5rem] font-black border-l border-b border-border-main ${
                        waifu.tier === 'SSR' || waifu.tier === 'UR' || waifu.tier === 'LIMITED' ? 'bg-secondary-yellow text-black' : 'bg-white text-black'
                      }`}>
                        {waifu.tier}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <WaifuCard waifu={result} />
            )}
          </div>

          <div className="flex gap-2 w-full mt-6">
            <button
              onClick={() => onRoll(isMultiple ? 10 : 1)}
              disabled={isRollDisabled}
              className={`btn-neo flex-1 text-sm ${isRollDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRollDisabled ? `TUNGGU (${countdown}s)` : isMultiple ? 'ROLL 10X LAGI' : 'LAGI'}
            </button>
            <Link
              to="/dashboard"
              className="btn-neo btn-neo-secondary flex-1 text-sm no-underline text-center"
            >
              INVENTORY
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
