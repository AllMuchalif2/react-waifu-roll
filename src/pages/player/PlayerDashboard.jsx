import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import WaifuCard from '../../components/WaifuCard';

// Harga jual waifu berdasarkan Tier
const PRICE_MAP = {
  C: 100,
  B: 150,
  A: 200,
  R: 250,
  S: 300,
  SR: 350,
  SSR: 400,
  UR: 450,
  LIMITED: 500,
};

export default function PlayerDashboard() {
  const { user, profile, fetchProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimMsg, setClaimMsg] = useState('');

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

  // Fitur Jual Waifu
  const handleSell = async (waifu) => {
    if (
      !confirm(
        `Jual ${waifu.name} seharga ${PRICE_MAP[waifu.tier] || 10} Koin?`,
      )
    )
      return;

    const idToSell = waifu.instanceIds[0]; // Ambil 1 ID untuk dihapus
    const price = PRICE_MAP[waifu.tier] || 10;

    // Hapus waifu dari inventory
    await supabase.from('user_waifus').delete().eq('id', idToSell);
    // Tambah koin pemain
    await supabase
      .from('profiles')
      .update({ coins: profile.coins + price })
      .eq('id', user.id);

    fetchProfile(user.id);
    fetchInventory();
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
                ID: {user.id.split('-')[0]}
              </p>
            </div>
            {profile.role === 'admin' && (
              <span className="px-2 py-1 bg-danger rounded-md text-xs font-black">
                ADMIN
              </span>
            )}
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex-1 bg-white/10 p-3 rounded-xl border border-white/20 text-center">
              <i className="fa-solid fa-coins text-secondary-yellow text-xl mb-1"></i>
              <div className="font-black text-lg">{profile.coins}</div>
              <div className="text-[0.65rem] opacity-70 uppercase tracking-wider">
                Koin
              </div>
            </div>
            <div className="flex-1 bg-white/10 p-3 rounded-xl border border-white/20 text-center">
              <i className="fa-solid fa-dice text-white text-xl mb-1"></i>
              <div className="font-black text-lg">{profile.dice_count}</div>
              <div className="text-[0.65rem] opacity-70 uppercase tracking-wider">
                Dadu
              </div>
            </div>
          </div>

          <button
            onClick={handleDailyClaim}
            className="btn-neo btn-neo-secondary w-full"
          >
            <i className="fa-solid fa-gift"></i> Klaim Dadu Harian
          </button>
          {claimMsg && (
            <div className="text-center text-sm font-bold text-secondary-yellow mt-2 animate-bounce">
              {claimMsg}
            </div>
          )}
        </div>

        {/* Inventory Waifu */}
        <h3 className="text-xl mb-4 text-center border-b-2 border-text-dark pb-2 inline-block mx-auto block w-max">
          Koleksi Waifu ({inventory.reduce((acc, curr) => acc + curr.total, 0)})
        </h3>

        {loading ? (
          <div className="text-center font-bold">Memuat koleksi...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {inventory.map((waifu) => (
              <WaifuCard
                key={waifu.id}
                waifu={waifu}
                isInventory={true}
                onSell={handleSell}
              />
            ))}
            {inventory.length === 0 && (
              <div className="col-span-full text-center text-text-muted mt-4 font-semibold">
                Koleksi masih kosong. Ayo gacha sekarang!
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
