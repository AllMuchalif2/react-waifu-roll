import { PRICE_MAP } from '../../config/gachaConfig';

export default function SellWaifuModal({
  waifu,
  sellAmount,
  setSellAmount,
  onConfirm,
  onCancel,
}) {
  if (!waifu) return null;

  return (
    <div className="fixed inset-0 bg-danger/80 backdrop-blur-sm z-100 flex items-center justify-center p-6 animate-fade-in">
      <div className="card-neo w-full max-w-sm bg-text-dark border-danger animate-zoom-in">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mb-4 border-2 border-danger text-danger">
            <i className="fa-solid fa-hand-holding-dollar text-4xl"></i>
          </div>
          <h2 className="text-xl font-black mb-1">Jual Waifu?</h2>
          <p className="text-xs text-text-muted mb-4">
            Pilih jumlah <b>{waifu.name}</b> yang ingin dijual:
          </p>

          <div className="w-full bg-text-dark p-4 rounded-2xl border-2 border-danger mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.65rem] font-black uppercase opacity-50">
                Jumlah (Maks: {waifu.total})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSellAmount(Math.max(1, sellAmount - 1))}
                  className="w-8 h-8 rounded-lg border-2 border-text-dark flex items-center justify-center font-black hover:bg-primary-blue hover:text-white"
                >
                  -
                </button>
                <input
                  type="number"
                  value={sellAmount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setSellAmount(Math.min(val, waifu.total));
                  }}
                  className="w-12 text-center font-black bg-transparent outline-none text-lg"
                />
                <button
                  onClick={() =>
                    setSellAmount(Math.min(waifu.total, sellAmount + 1))
                  }
                  className="w-8 h-8 rounded-lg border-2 border-text-dark flex items-center justify-center font-black hover:bg-primary-blue hover:text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t-2 border-text-dark/5">
              <span className="text-[0.65rem] font-black uppercase opacity-50">
                Total Koin
              </span>
              <span className="text-secondary-yellow font-black text-xl drop-shadow-sm flex items-center gap-1">
                <i className="fa-solid fa-coins"></i>{' '}
                {(PRICE_MAP[waifu.tier] || 10) * sellAmount}
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 py-3 border-2 border-text-dark rounded-xl font-bold uppercase text-xs"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 btn-neo btn-neo-danger py-3 text-xs"
            >
              JUAL {sellAmount} UNIT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
