export default function InventoryFilters({ 
  search, 
  setSearch, 
  tierFilter, 
  setTierFilter,
  isSelectionMode,
  onToggleSelectionMode,
  selectedCount,
  onBulkSell
}) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
          <input
            type="text"
            placeholder="Cari koleksi waifu..."
            className="w-full pl-10 pr-4 py-3 border-2 border-text-dark rounded-xl outline-none focus:border-primary-blue transition-colors font-sans font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={onToggleSelectionMode}
          className={`px-4 py-2 rounded-xl border-2 font-black text-xs uppercase transition-all shadow-[3px_3px_0px_var(--border)] active:translate-x-px active:translate-y-px active:shadow-none ${
            isSelectionMode 
              ? 'bg-danger text-white border-border-main' 
              : 'bg-card-bg text-primary-blue border-border-main'
          }`}
        >
          <i className={`fa-solid ${isSelectionMode ? 'fa-xmark' : 'fa-list-check'} mr-2`}></i>
          {isSelectionMode ? 'Batal' : 'Bulk Sell'}
        </button>
      </div>

      {isSelectionMode && (
        <button
          onClick={onBulkSell}
          disabled={selectedCount === 0}
          className="btn-neo btn-neo-danger w-full py-3 flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-trash-can"></i>
          JUAL {selectedCount} JENIS WAIFU
        </button>
      )}

      <select
        className="p-3 border-2 border-text-dark rounded-xl outline-none font-sans font-bold bg-card-bg text-text-main cursor-pointer"
        value={tierFilter}
        onChange={(e) => setTierFilter(e.target.value)}
      >
        <option value="">Semua Tier</option>
        <option value="C">Tier C</option>
        <option value="B">Tier B</option>
        <option value="A">Tier A</option>
        <option value="R">Tier R</option>
        <option value="S">Tier S</option>
        <option value="SR">Tier SR</option>
        <option value="SSR">Tier SSR</option>
        <option value="UR">Tier UR</option>
        <option value="LIMITED">LIMITED</option>
      </select>
    </div>
  );
}
