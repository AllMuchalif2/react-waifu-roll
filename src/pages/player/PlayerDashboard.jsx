import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import WaifuCard from '../../components/WaifuCard';
import { PRICE_MAP } from '../../config/gachaConfig';

export default function PlayerDashboard() {
  const { user, profile, fetchProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimMsg, setClaimMsg] = useState('');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [sellingWaifu, setSellingWaifu] = useState(null);
  const [sellAmount, setSellAmount] = useState(1);
  const [isBuyingDice, setIsBuyingDice] = useState(false);
  const [buyAmount, setBuyAmount] = useState(1);

  // Filter Inventory di sisi Client
  const filteredInventory = inventory.filter((item) => {
    const matchName = item.name.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter ? item.tier === tierFilter : true;
    return matchName && matchTier;
  });

  // Proteksi Halaman (Redirect jika belum login)
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchInventory();
  }, [user]);

  // Ambil data waifu dan kelompokkan (Grouping)
  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('user_waifus')
      .select('id, waifu_pool(*)')
      .eq('user_id', user.id);

    if (data) {
      // Mengelompokkan waifu yang sama agar tidak menuh-menuhin layar
      const grouped = data.reduce((acc, curr) => {
        const w = curr.waifu_pool;
        if (!acc[w.id]) {
          acc[w.id] = { ...w, total: 0, instanceIds: [] };
        }
        acc[w.id].total += 1;
        acc[w.id].instanceIds.push(curr.id); // Simpan ID unik tabel untuk dijual nanti
        return acc;
      }, {});
      setInventory(Object.values(grouped).sort((a, b) => b.total - a.total));
    }
    setLoading(false);
  };

  // Fitur Klaim Dadu Harian
  const handleDailyClaim = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (profile.last_daily_claim === today) {
      setClaimMsg('Anda sudah klaim hadiah hari ini!');
      setTimeout(() => setClaimMsg(''), 3000);
      return;
    }

    const newDice = profile.dice_count + 10;
    await supabase
      .from('profiles')
      .update({ dice_count: newDice, last_daily_claim: today })
      .eq('id', user.id);

    setClaimMsg('+10 Dadu Berhasil Diklaim!');
    fetchProfile(user.id); // Update context
    setTimeout(() => setClaimMsg(''), 3000);
  };

  // Fitur Beli Dadu
  const confirmBuyDice = async () => {
    const totalCost = buyAmount * 100;
    if (profile.coins < totalCost) {
      alert('Koin tidak cukup!');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        coins: profile.coins - totalCost,
        dice_count: profile.dice_count + buyAmount,
      })
      .eq('id', user.id);

    if (!error) {
      await fetchProfile(user.id);
      setIsBuyingDice(false);
      setBuyAmount(1);
    }
    setLoading(false);
  };

  // Tahap 1: Buka Modal Konfirmasi Jual
  const handleSell = (waifu) => {
    setSellingWaifu(waifu);
    setSellAmount(1); // Reset jumlah jual ke 1
  };

  // Tahap 2: Eksekusi Jual (Setelah Klik di Modal)
  const confirmSell = async () => {
    if (!sellingWaifu || sellAmount < 1) return;

    // Pastikan tidak menjual lebih dari yang dimiliki
    const finalAmount = Math.min(sellAmount, sellingWaifu.total);
    const idsToSell = sellingWaifu.instanceIds.slice(0, finalAmount);
    const pricePerUnit = PRICE_MAP[sellingWaifu.tier] || 10;
    const totalPrice = pricePerUnit * finalAmount;

    setLoading(true);
    // Hapus beberapa waifu sekaligus dari inventory
    await supabase.from('user_waifus').delete().in('id', idsToSell);
    // Tambah koin pemain (total)
    await supabase
      .from('profiles')
      .update({ coins: profile.coins + totalPrice })
      .eq('id', user.id);

    await fetchProfile(user.id);
    await fetchInventory();
    setSellingWaifu(null); // Tutup Modal
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (authLoading || !profile)
    return <div className="text-center mt-20 font-bold">Memuat Profil...</div>;

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-3xl mx-auto pb-24">
        {/* Panel Status Pemain */}
        <div className="card-neo mb-6 bg-text-dark text-white border-primary-blue shadow-[6px_6px_0px_#3d5afe]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl text-secondary-yellow">
                {profile.username}
              </h2>
              <p className="text-xs opacity-70 font-mono mt-1">
                {user.email} | {profile.role === 'admin' && 'ADMIN'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleLogout}
                className="text-[0.6rem] bg-white/10 hover:bg-danger/20 px-2 py-1 rounded-md transition-colors border border-white/20 uppercase font-black tracking-tighter"
              >
                <i className="fa-solid fa-right-from-bracket mr-1"></i>
                Keluar
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex-1 bg-white/10 p-3 rounded-xl border border-white/20 text-center">
              <i className="fa-solid fa-coins text-secondary-yellow text-xl mb-1"></i>
              <div className="font-black text-lg">{profile.coins}</div>
              <div className="text-[0.65rem] opacity-70 uppercase tracking-wider">
                Koin
              </div>
            </div>
            <div className="flex-1 bg-white/10 p-3 rounded-xl border border-white/20 text-center relative group">
              <i className="fa-solid fa-dice text-white text-xl mb-1"></i>
              <div className="font-black text-lg">{profile.dice_count}</div>
              <div className="text-[0.65rem] opacity-70 uppercase tracking-wider">
                Dadu
              </div>
              <button
                onClick={() => setIsBuyingDice(true)}
                className="absolute top-1 right-1 w-6 h-6 bg-secondary-yellow text-text-dark rounded-full flex items-center justify-center border border-text-dark text-xs font-black shadow-[2px_2px_0px_#1a1a1a] hover:scale-110 active:scale-95 transition-transform"
                title="Beli Dadu"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {profile.last_daily_claim !==
            new Date().toISOString().split('T')[0] ? (
              <button
                onClick={handleDailyClaim}
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

          {claimMsg && (
            <div className="text-center text-sm font-bold text-secondary-yellow mt-2 animate-bounce">
              {claimMsg}
            </div>
          )}
        </div>

        {/* Akses Cepat Luar Card */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <Link to="/history" className="btn-neo no-underline text-[0.65rem]">
            <i className="fa-solid fa-clock-rotate-left"></i> Riwayat
          </Link>

          <Link
            to="/suggestions"
            className="btn-neo btn-neo-secondary no-underline text-[0.65rem]"
          >
            <i className="fa-solid fa-lightbulb"></i> Saran
          </Link>

          {profile.role === 'admin' && (
            <Link
              to="/admin"
              className="btn-neo btn-neo-danger no-underline text-[0.65rem]"
            >
              <i className="fa-solid fa-user-gear"></i> Admin
            </Link>
          )}
        </div>

        {/* Filter & Search Inventory */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
            <input
              type="text"
              placeholder="Cari koleksi waifu..."
              className="w-full pl-10 pr-4 py-3 border-2 border-text-dark rounded-xl outline-none focus:border-primary-blue transition-colors font-sans font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="p-3 border-2 border-text-dark rounded-xl outline-none font-sans font-bold bg-white cursor-pointer"
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

        {/* Inventory Waifu */}
        <h3 className="text-xl mb-4 text-center border-b-2 border-text-dark pb-2 inline-block mx-auto block w-max uppercase italic font-black">
          Koleksi Waifu (
          {filteredInventory.reduce((acc, curr) => acc + curr.total, 0)})
        </h3>

        {loading ? (
          <div className="text-center font-bold animate-pulse py-10">
            Memuat koleksi...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredInventory.map((waifu) => (
              <WaifuCard
                key={waifu.id}
                waifu={waifu}
                isInventory={true}
                onSell={handleSell}
              />
            ))}
            {filteredInventory.length === 0 && (
              <div className="col-span-full text-center text-text-muted mt-4 font-semibold italic opacity-50">
                Tidak ada waifu yang cocok dengan filter.
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL JUAL WAIFU (Premium UI) */}
      {sellingWaifu && (
        <div className="fixed inset-0 bg-text-dark/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="card-neo w-full max-w-sm bg-white animate-zoom-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mb-4 border-2 border-danger text-danger">
                <i className="fa-solid fa-hand-holding-dollar text-4xl"></i>
              </div>
              <h2 className="text-xl font-black mb-1">Jual Waifu?</h2>
              <p className="text-xs text-text-muted mb-4">
                Pilih jumlah <b>{sellingWaifu.name}</b> yang ingin dijual:
              </p>

              {/* Input Jumlah Jual */}
              <div className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-text-dark mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[0.65rem] font-black uppercase opacity-50">
                    Jumlah (Maks: {sellingWaifu.total})
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
                        setSellAmount(Math.min(val, sellingWaifu.total));
                      }}
                      className="w-12 text-center font-black bg-transparent outline-none text-lg"
                    />
                    <button
                      onClick={() =>
                        setSellAmount(
                          Math.min(sellingWaifu.total, sellAmount + 1),
                        )
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
                    {(PRICE_MAP[sellingWaifu.tier] || 10) * sellAmount}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setSellingWaifu(null)}
                  className="flex-1 py-3 border-2 border-text-dark rounded-xl font-bold uppercase text-xs"
                >
                  Batal
                </button>
                <button
                  onClick={confirmSell}
                  className="flex-1 btn-neo btn-neo-danger py-3 text-xs"
                >
                  JUAL {sellAmount} UNIT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BELI DADU */}
      {isBuyingDice && (
        <div className="fixed inset-0 bg-text-dark/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="card-neo w-full max-w-sm bg-white animate-zoom-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary-blue/10 rounded-full flex items-center justify-center mb-4 border-2 border-primary-blue text-primary-blue">
                <i className="fa-solid fa-dice text-4xl"></i>
              </div>
              <h2 className="text-xl font-black mb-1">Beli Dadu?</h2>
              <p className="text-xs text-text-muted mb-4">
                Tukar koin Anda menjadi dadu gacha. <br />
                <b>1 Dadu = 100 Koin</b>
              </p>

              <div className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-text-dark mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[0.65rem] font-black uppercase opacity-50">
                    Jumlah Dadu
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBuyAmount(Math.max(1, buyAmount - 1))}
                      className="w-8 h-8 rounded-lg border-2 border-text-dark flex items-center justify-center font-black hover:bg-primary-blue hover:text-white"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={buyAmount}
                      min={1}
                      max={Math.floor(profile.coins / 100)}
                      onChange={(e) =>
                        setBuyAmount(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-12 text-center font-black bg-transparent outline-none text-lg"
                    />
                    <button
                      onClick={() => setBuyAmount(buyAmount + 1)}
                      className="w-8 h-8 rounded-lg border-2 border-text-dark flex items-center justify-center font-black hover:bg-primary-blue hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t-2 border-text-dark/5">
                  <span className="text-[0.65rem] font-black uppercase opacity-50">
                    Biaya Koin
                  </span>
                  <span className="text-danger font-black text-xl drop-shadow-sm flex items-center gap-1">
                    <i className="fa-solid fa-coins"></i> {buyAmount * 100}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsBuyingDice(false)}
                  className="flex-1 py-3 border-2 border-text-dark rounded-xl font-bold uppercase text-xs"
                >
                  Batal
                </button>
                <button
                  onClick={confirmBuyDice}
                  disabled={profile.coins < buyAmount * 100}
                  className="flex-1 btn-neo py-3 text-xs"
                >
                  BELI SEKARANG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </>
  );
}
