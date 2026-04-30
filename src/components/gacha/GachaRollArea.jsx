import { Link } from 'react-router-dom';
import WaifuCard from '../WaifuCard';

export default function GachaRollArea({ 
  isFetching, 
  result, 
  isRollDisabled, 
  countdown, 
  onRoll 
}) {
  return (
    <div className="relative min-h-[300px] flex flex-col items-center justify-center mt-4">
      {isFetching ? (
        <div className="p-1 text-center">
          <p className="text-sm font-bold text-primary-blue">
            <i className="fa-solid fa-spinner fa-spin"></i> Menggacha...
          </p>
        </div>
      ) : !result ? (
        <button
          onClick={onRoll}
          disabled={isRollDisabled}
          className={`btn-neo text-xl py-4 mt-4 w-full max-w-[250px] ${isRollDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRollDisabled ? `TUNGGU (${countdown}s)` : 'ROLL SEKARANG'}
        </button>
      ) : null}

      {result && !isFetching && (
        <div className="result-card w-full max-w-[280px] flex flex-col items-center animate-fade-in">
          <div className="card-neo p-4 text-center overflow-hidden">
            <h3 className="text-sm text-primary-blue mb-3 font-black uppercase">
              Selamat! Kamu mendapatkan:
            </h3>
            <WaifuCard waifu={result} />
          </div>

          <div className="flex gap-2 w-full mt-6">
            <button
              onClick={onRoll}
              disabled={isRollDisabled}
              className={`btn-neo flex-1 text-sm ${isRollDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRollDisabled ? `TUNGGU (${countdown}s)` : 'LAGI'}
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
