import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Cek sesi login saat aplikasi pertama kali dimuat
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    };

    getSession();

    // 2. Pantau perubahan status auth (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fungsi dengan sistem Retry (Anti Race-Condition) & Self-Healing
  const fetchProfile = async (userId, retryCount = 0) => {
    // 1. Gunakan maybeSingle() agar tidak error 406 jika data kosong
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    } else if (retryCount < 3) {
      // 2. Race condition terjadi: Profil sedang dibuat oleh halaman Register.
      // Kita suruh sistem menunggu 0.5 detik lalu mencoba mencari lagi.
      setTimeout(() => fetchProfile(userId, retryCount + 1), 500);
    } else {
      // 3. Self-healing: Jika sudah ditunggu tetap tidak ada (mungkin gagal simpan saat register),
      // kita buatkan profil darurat otomatis agar aplikasi tidak stuck.
      const fallbackProfile = {
        id: userId,
        username: 'Player_' + userId.substring(0, 5),
        coins: 0,
        dice_count: 10,
      };
      await supabase.from('profiles').insert([fallbackProfile]);
      setProfile(fallbackProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, fetchProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook kustom agar memanggil auth lebih mudah di komponen lain
export const useAuth = () => useContext(AuthContext);
