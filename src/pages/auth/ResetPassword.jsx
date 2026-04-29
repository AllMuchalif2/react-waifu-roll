import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase secara otomatis menangani token reset dari URL
    // Jika user mengakses halaman ini tanpa session reset, kita bisa arahkan balik
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Jika tidak ada session (token tidak valid/expired), suruh minta reset lagi
        // Namun biasanya Supabase menangani ini di background
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Password konfirmasi tidak cocok!');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError('Gagal memperbarui password: ' + error.message);
    } else {
      setMessage('Password berhasil diperbarui! Mengalihkan ke dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-sm mx-auto mt-10">
        <div className="card-neo bg-white animate-fade-in">
          <h1 className="text-2xl font-black uppercase italic mb-2 text-center text-primary-blue">
            Setel Password Baru
          </h1>
          <p className="text-center text-xs font-bold text-text-muted mb-6">
            Masukkan password baru Anda di bawah ini.
          </p>

          {message && (
            <div className="mb-4 p-3 bg-success/10 text-success border-2 border-success rounded-xl text-xs font-black text-center animate-zoom-in">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-danger/10 text-danger border-2 border-danger rounded-xl text-xs font-black text-center animate-zoom-in">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password Baru"
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-3 border-2 border-text-dark rounded-xl outline-none focus:border-primary-blue font-sans font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary-blue"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            <div className="relative">
              <i className="fa-solid fa-check-double absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Konfirmasi Password"
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-3 border-2 border-text-dark rounded-xl outline-none focus:border-primary-blue font-sans font-bold"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary-blue"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-neo mt-2 w-full py-3"
            >
              {loading ? (
                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
              ) : (
                <i className="fa-solid fa-key mr-2"></i>
              )}
              {loading ? 'Memproses...' : 'UPDATE PASSWORD'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
