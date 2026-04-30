import { DROP_RATES, PRICE_MAP } from '../../config/gachaConfig';

export default function GachaRatesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="card-neo mb-6 bg-card-bg text-left animate-fade-in relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-text-muted hover:text-danger"
      >
        <i className="fa-solid fa-xmark text-xl"></i>
      </button>
      <h3 className="text-sm font-black mb-3 border-b-2 border-border-main pb-1 uppercase italic">
        Gacha Rates & Prices
      </h3>
      <div className="flex flex-col gap-1">
        {DROP_RATES.map((r) => (
          <div
            key={r.tier}
            className="flex justify-between text-[0.7rem]"
          >
            <span className="font-bold">
              {r.label || r.tier} ({r.tier})
            </span>
            <div className="flex gap-3">
              <span className="text-primary-blue font-black">
                {r.chance}%
              </span>
              <span className="text-text-main px-1 rounded font-bold">
                {PRICE_MAP[r.tier]} Koin
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[0.6rem] mt-3 opacity-50 italic">
        * Harga di atas adalah harga jual waifu ke sistem.
      </p>
    </div>
  );
}
