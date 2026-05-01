export default function DashboardStats({ profile, onBuyDice, onDailyClaim }) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="flex gap-4 mb-4">
        <div className="flex-1 bg-primary-blue/10 p-3 rounded-xl border border-primary-blue/20 text-center">
          <i className="fa-solid fa-coins text-secondary-yellow text-xl mb-1"></i>
          <div className="font-black text-lg">{profile.coins}</div>
          <div className="text-[0.65rem] opacity-70 uppercase tracking-wider">
            Koin
          </div>
        </div>
        <div className="flex-1 bg-primary-blue/10 p-3 rounded-xl border border-primary-blue/20 text-center relative group">
          <i className="fa-solid fa-dice text-secondary-yellow text-xl mb-1"></i>
          <div className="font-black text-lg">{profile.dice_count}</div>
          <div className="text-[0.65rem] opacity-70 uppercase tracking-wider">
            Dadu
          </div>
          <button
            onClick={onBuyDice}
            className="absolute top-1 right-1 w-6 h-6 bg-secondary-yellow text-black rounded-full flex items-center justify-center border border-text-main text-xs font-black shadow-[2px_2px_0px_#1a1a1a] hover:scale-110 active:scale-95 transition-transform"
            title="Beli Dadu"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {profile.last_daily_claim !== today ? (
          <button
            onClick={onDailyClaim}
            className="btn-neo btn-neo-secondary w-full"
          >
            <i className="fa-solid fa-gift"></i> Klaim Dadu Harian
          </button>
        ) : (
          <div className="text-center py-3 bg-white/5 rounded-xl border border-dashed border-white/20 text-xs font-bold opacity-60 uppercase tracking-widest">
            <i className="fa-solid fa-check-circle mr-2 text-secondary-yellow"></i>
            Hadiah harian sudah diambil
          </div>
        )}
      </div>

    </>
  );
}
