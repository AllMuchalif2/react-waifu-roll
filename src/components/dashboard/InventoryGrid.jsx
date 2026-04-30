import WaifuCard from '../WaifuCard';

export default function InventoryGrid({ 
  inventory, 
  loading, 
  onSell,
  isSelectionMode = false,
  selectedPoolIds = [],
  onToggleSelection
}) {
  const totalWaifus = inventory.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <>
      <h3 className="text-xl mb-4 text-center border-b-2 border-text-dark pb-2 inline-block mx-auto block w-max uppercase italic font-black">
        Koleksi Waifu ({totalWaifus})
      </h3>

      {loading ? (
        <div className="text-center font-bold animate-pulse py-10">
          Memuat koleksi...
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {inventory.map((waifu) => (
            <WaifuCard
              key={waifu.id}
              waifu={waifu}
              isInventory={true}
              onSell={onSell}
              isSelectionMode={isSelectionMode}
              isSelected={selectedPoolIds.includes(waifu.id)}
              onToggleSelection={onToggleSelection}
            />
          ))}
          {inventory.length === 0 && (
            <div className="col-span-full text-center text-text-muted mt-4 font-semibold italic opacity-50">
              Tidak ada waifu yang cocok dengan filter.
            </div>
          )}
        </div>
      )}
    </>
  );
}
