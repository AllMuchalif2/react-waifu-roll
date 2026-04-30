const tierColors = {
  C: 'bg-[#adb5bd] text-white',
  B: 'bg-[#51cf66] text-white',
  A: 'bg-[#339af0] text-white',
  R: 'bg-[#cc5de8] text-white',
  S: 'bg-[#f06595] text-white',
  SR: 'bg-[#ff922b] text-white',
  SSR: 'bg-[#fcc419] text-[#1a1a1a]',
  UR: 'bg-[#ff6b6b] text-white',
  LIMITED: 'bg-gradient-to-r from-[#ff6b6b] to-[#fcc419] text-white',
};

export default function WaifuCard({ 
  waifu, 
  isInventory = false, 
  onSell, 
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection 
}) {
  const badgeColor = tierColors[waifu.tier] || tierColors.C;

  const handleClick = () => {
    if (isSelectionMode && onToggleSelection) {
      onToggleSelection(waifu.id);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-3 border-2 rounded-xl bg-card-bg text-center transition-all duration-200 relative group cursor-pointer ${
        isSelectionMode && isSelected 
          ? 'border-primary-blue scale-[0.98] shadow-[inset_0_0_0_4px_rgba(61,90,254,0.1)]' 
          : 'border-border-main hover:-translate-y-1'
      }`}
    >
      {isSelectionMode && (
        <div className={`absolute top-2 left-2 w-6 h-6 rounded-lg border-2 z-20 flex items-center justify-center transition-all ${
          isSelected ? 'bg-primary-blue border-primary-blue text-white' : 'bg-white/50 border-border-main'
        }`}>
          {isSelected && <i className="fa-solid fa-check text-[0.8rem]"></i>}
        </div>
      )}

      <div
        className={`absolute px-2 py-1 rounded-md text-[0.7rem] font-extrabold border border-border-main z-10 ${badgeColor} ${isInventory ? 'top-[-5px] right-[-5px] rotate-[5deg]' : 'top-[10px] right-[10px]'}`}
      >
        {isInventory ? `x${waifu.total}` : waifu.tier}
      </div>

      <img
        src={waifu.image_url}
        alt={waifu.name}
        loading="lazy"
        className={`w-full rounded-lg border border-border-main aspect-square object-cover mb-2 transition-all ${
          isSelectionMode && !isSelected ? 'opacity-70 grayscale-[0.5]' : ''
        }`}
      />

      <div className="text-xs font-black leading-[1.2] line-clamp-2 text-text-main">
        {waifu.name}
      </div>

      {!isInventory ? (
        <div className="flex flex-col gap-1">
          {waifu.tier === 'LIMITED' && waifu.owner && (
            <div className="text-[0.65rem] bg-border-main text-secondary-yellow py-1 px-2 rounded-lg font-black uppercase">
              <i className="fa-solid fa-crown mr-1"></i>
              {waifu.owner}
            </div>
          )}
        </div>
      ) : (
        <>
          {!isSelectionMode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSell && onSell(waifu);
              }}
              className="btn-neo-secondary mt-2 w-full px-2 py-1 text-[0.7rem] rounded-lg"
            >
              JUAL
            </button>
          )}
        </>
      )}
    </div>
  );
}
