import { Link } from 'react-router-dom';
import WaifuCard from '../WaifuCard';
import { TIER_CONFIG } from '../../config/tierConfig';

export default function GachaRollArea({
  isFetching,
  result,
  isRollDisabled,
  countdown,
  onRoll,
}) {
  const isMultiple = Array.isArray(result);

  return (
    <div className="relative min-h-[300px] flex flex-col items-center justify-center mt-4">
      {isFetching ? (
        <div className="p-1 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-black text-primary animate-pulse uppercase italic">
            Sedang Menggacha...
          </p>
        </div>
      ) : !result ? (
        <div className="flex flex-col gap-3 w-full max-w-[280px]">
          <button
            onClick={() => onRoll(1)}
            disabled={isRollDisabled}
            className={`btn-neo text-xl text-secondary py-4 ${isRollDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRollDisabled ? `TUNGGU (${countdown}s)` : 'ROLL 1X'}
          </button>
          <button
            onClick={() => onRoll(10)}
            disabled={isRollDisabled}
            className={`btn-neo btn-neo-secondary text-primary text-xl py-4 ${isRollDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRollDisabled ? `TUNGGU (${countdown}s)` : 'ROLL 10X'}
          </button>
        </div>
      ) : null}

      {result && !isFetching && (
        <div
          className={`result-card w-full ${isMultiple ? 'max-w-md' : 'max-w-[220px]'} flex flex-col items-center animate-zoom-in mx-auto`}
        >
          <div className="card-neo p-4 text-center w-full overflow-hidden">
            <h3 className="text-sm text-primary mb-3 font-black uppercase italic border-b-2 border-border-main pb-2">
              Selamat! Kamu mendapatkan:
            </h3>

            {isMultiple ? (
              <div className="grid grid-cols-5 gap-1.5">
                {result.map((waifu, idx) => {
                  const style = TIER_CONFIG[waifu.tier] || TIER_CONFIG.C;
                  const isHighTier = ['SSR', 'UR', 'LIMITED'].includes(
                    waifu.tier,
                  );

                  return (
                    <div
                      key={idx}
                      className="relative group animate-fade-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div
                        className={`border rounded-md overflow-hidden bg-white transition-transform hover:scale-105 shadow-[1px_1px_0px_var(--border)] ${isHighTier ? 'border-primary' : 'border-border-main'}`}
                      >
                        <img
                          src={waifu.image_url}
                          alt={waifu.name}
                          className="w-full aspect-square object-cover"
                        />
                        <div
                          className={`absolute top-0 right-0 px-1 rounded-bl-md text-[0.55rem] font-black border-l border-b border-border-main ${style.color} ${style.textColor}`}
                        >
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
          </div>

          <div className="flex flex-col gap-2 w-full mt-4">
            <div className="flex gap-2 w-full">
              <button
                onClick={() => onRoll(1)}
                disabled={isRollDisabled}
                className={`btn-neo flex-1 text-[0.65rem] px-2 py-3 ${isRollDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRollDisabled ? `TUNGGU (${countdown}s)` : 'LAGI 1X'}
              </button>
              <button
                onClick={() => onRoll(10)}
                disabled={isRollDisabled}
                className={`btn-neo btn-neo-secondary flex-1 text-[0.65rem] px-2 py-3 ${isRollDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRollDisabled ? `TUNGGU (${countdown}s)` : 'LAGI 10X'}
              </button>
            </div>
            <Link
              to="/dashboard"
              className="btn-neo btn-neo-outline w-full text-xs py-3 no-underline text-center"
            >
              INVENTORY
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
