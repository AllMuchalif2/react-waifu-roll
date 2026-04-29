// Mapping warna tier langsung menggunakan utilitas Tailwind
const tierColors = {
  C: 'bg-[#adb5bd] text-white',
  B: 'bg-[#51cf66] text-white',
  A: 'bg-[#339af0] text-white',
  R: 'bg-[#cc5de8] text-white',
  S: 'bg-[#f06595] text-white',
  SR: 'bg-[#ff922b] text-white',
  SSR: 'bg-[#fcc419] text-text-dark',
  UR: 'bg-[#ff6b6b] text-white',
  LIMITED: 'bg-gradient-to-r from-[#ff6b6b] to-[#fcc419] text-white',
};

export default function WaifuCard({ waifu, isInventory = false, onSell }) {
  const badgeColor = tierColors[waifu.tier] || tierColors.C;

  return (
    <div className="p-3 border-2 border-text-dark rounded-xl bg-white text-center transition-transform duration-200 hover:-translate-y-1 relative">
      {/* Badge Tier / Quantity */}
      <div
        className={`absolute px-2 py-1 rounded-md text-[0.7rem] font-extrabold border border-text-dark z-10 ${badgeColor} ${isInventory ? 'top-[-5px] right-[-5px] rotate-[5deg]' : 'top-[10px] right-[10px]'}`}
      >
        {isInventory ? `x${waifu.total}` : waifu.tier}
      </div>

      <img
        src={waifu.image_url}
        alt={waifu.name}
        loading="lazy"
        className="w-full rounded-lg border border-text-dark aspect-square object-cover mb-2"
      />

      <div className="text-xs font-black leading-[1.2] mb-[2px] line-clamp-2 h-[1.8rem]">
        {waifu.name}
      </div>

      {/* Footer Card menyesuaikan konteks (Inventory vs Pool biasa) */}
      {!isInventory ? (
        <div className="text-[0.75rem] text-text-muted mt-1">
          ID: {waifu.jikan_id}
        </div>
      ) : (
        <>
          <div className="text-[0.75rem] font-bold opacity-60">
            [{waifu.tier}]
          </div>
          {waifu.tier === 'LIMITED' && (
            <div className="text-[0.75rem] font-black text-danger mt-[2px]">
              UNIK 1/1
            </div>
          )}
          <button
            type="button"
            onClick={() => onSell && onSell(waifu)}
            className="btn-neo-secondary mt-2 w-full px-2 py-1 text-[0.7rem] rounded-lg"
          >
            JUAL
          </button>
        </>
      )}
    </div>
  );
}
