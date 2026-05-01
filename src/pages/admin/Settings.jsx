import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import { toast } from 'react-hot-toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('tier_settings')
        .select('*')
        .order('sell_price', { ascending: false });

      if (error) throw error;
      setSettings(data || []);
    } catch (err) {
      toast.error('Gagal memuat pengaturan.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (tier, field, value) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.tier === tier ? { ...s, [field]: parseFloat(value) || 0 } : s,
      ),
    );
  };

  const calculateTotalChance = () => {
    return settings.reduce((acc, s) => acc + s.drop_chance, 0).toFixed(2);
  };

  const saveSettings = async () => {
    const total = calculateTotalChance();
    if (parseFloat(total) !== 100.0) {
      toast.error(`Total peluang harus 100%! (Sekarang: ${total}%)`);
      return;
    }

    setSaving(true);
    try {
      for (const item of settings) {
        const { error } = await supabase
          .from('tier_settings')
          .update({
            sell_price: item.sell_price,
            drop_chance: item.drop_chance,
          })
          .eq('tier', item.tier);

        if (error) throw error;
      }
      toast.success('Pengaturan berhasil disimpan!');
    } catch (err) {
      toast.error('Gagal menyimpan perubahan.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 font-black">
        MEMUAT PUSAT KENDALI...
      </div>
    );

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-2xl mx-auto pb-24 mt-6">
        <div className="card-neo bg-primary-blue text-white mb-8 p-6 shadow-[8px_8px_0px_#1a1a1a] relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h1 className="text-2xl font-black uppercase italic tracking-tighter">
                Economy Control
              </h1>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-1">
                Atur Harga Jual & Drop Rates Gacha
              </p>
            </div>
            <Link 
              to="/admin" 
              className="bg-white text-primary-blue px-3 py-1.5 rounded-lg font-black text-[0.6rem] uppercase border-2 border-text-dark shadow-[3px_3px_0px_#1a1a1a] active:translate-x-px active:translate-y-px active:shadow-none transition-all no-underline"
            >
              <i className="fa-solid fa-arrow-left mr-1"></i> Kembali
            </Link>
          </div>
          <i className="fa-solid fa-gears absolute -right-4 -bottom-4 text-white/10 text-8xl rotate-12"></i>
        </div>

        <div className="space-y-4">
          {settings.map((item) => (
            <div
              key={item.tier}
              className="card-neo flex flex-col sm:flex-row items-center gap-4 p-4 border-2"
            >
              <div className="w-20 text-center">
                <span className="text-lg font-black">{item.tier}</span>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                <div>
                  <label className="text-[0.6rem] font-black uppercase text-text-muted mb-1 block">
                    Harga Jual
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-coins absolute left-3 top-1/2 -translate-y-1/2 text-secondary-yellow text-xs"></i>
                    <input
                      type="number"
                      value={item.sell_price}
                      onChange={(e) =>
                        handleUpdate(item.tier, 'sell_price', e.target.value)
                      }
                      className="w-full pl-8 pr-3 py-2 border-2 border-text-dark rounded-lg font-black text-sm outline-none focus:border-primary-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[0.6rem] font-black uppercase text-text-muted mb-1 block">
                    Drop Chance (%)
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-percentage absolute left-3 top-1/2 -translate-y-1/2 text-primary-blue text-xs"></i>
                    <input
                      type="number"
                      step="0.01"
                      value={item.drop_chance}
                      onChange={(e) =>
                        handleUpdate(item.tier, 'drop_chance', e.target.value)
                      }
                      className="w-full pl-8 pr-3 py-2 border-2 border-text-dark rounded-lg font-black text-sm outline-none focus:border-primary-blue"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info & Save */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-text-dark p-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[0.6rem] text-black uppercase text-text-dark opacity-60">
                Total Peluang
              </span>
              <span
                className={`text-xl font-black ${parseFloat(calculateTotalChance()) === 100 ? 'text-green-600' : 'text-danger'}`}
              >
                {calculateTotalChance()}%
              </span>
            </div>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="btn-neo btn-neo-secondary px-10 py-3 flex-1 sm:flex-none"
            >
              <i className="fa-solid fa-save mr-2"></i>
              {saving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
