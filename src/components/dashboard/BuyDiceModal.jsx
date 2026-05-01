import { DICE_PRICE } from '../../config/gachaConfig';

export default function BuyDiceModal({
  isOpen,
  buyAmount,
  setBuyAmount,
  coins,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const maxAmount = Math.floor(coins / DICE_PRICE);

  return (
    <div className="fixed inset-0 bg-primary-blue/80 backdrop-blur-sm z-100 flex items-center justify-center p-6 animate-fade-in">
      <div className="card-neo w-full max-w-sm bg-text-dark border-primary-blue animate-zoom-in">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-primary-blue/10 rounded-full flex items-center justify-center mb-4 border-2 border-primary-blue text-primary-blue">
            <i className="fa-solid fa-dice text-4xl"></i>
          </div>
          <h2 className="text-xl font-black mb-1 text-text-dark">Beli Dadu?</h2>
          <p className="text-xs text-text-muted mb-4">
            Tukar koin Anda menjadi dadu gacha. <br />
            <b>1 Dadu = {DICE_PRICE} Koin</b>
          </p>

          <div className="w-full bg-main p-4 rounded-2xl border-2 border-primary-blue mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.65rem] font-black uppercase opacity-50 text-text-dark">
                Jumlah Dadu
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBuyAmount(Math.max(1, buyAmount - 1))}
                  className="w-8 h-8 rounded-lg border-2 border-text-dark flex items-center justify-center font-black hover:bg-primary-blue hover:text-white transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={buyAmount}
                  min={1}
                  max={maxAmount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setBuyAmount(Math.min(Math.max(1, val), Math.max(1, maxAmount)));
                  }}
                  className="w-12 text-center font-black bg-transparent outline-none text-lg text-text-dark"
                />
                <button
                  onClick={() => setBuyAmount(Math.min(buyAmount + 1, maxAmount))}
                  disabled={buyAmount >= maxAmount}
                  className="w-8 h-8 rounded-lg border-2 border-text-dark flex items-center justify-center font-black hover:bg-primary-blue hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t-2 border-text-dark/5">
              <span className="text-[0.65rem] font-black uppercase opacity-50 text-text-dark">
                Biaya Koin
              </span>
              <span className="text-danger font-black text-xl drop-shadow-sm flex items-center gap-1">
                <i className="fa-solid fa-coins"></i> {buyAmount * DICE_PRICE}
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
              disabled={coins < buyAmount * 100}
              className="flex-1 btn-neo py-3 text-xs"
            >
              BELI SEKARANG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
