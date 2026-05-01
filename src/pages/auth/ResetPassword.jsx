import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { validateForm } from '../../lib/validation';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
      } catch (err) {
        setError('Sesi reset tidak valid atau telah kadaluarsa.');
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setErrors({});

    const { isValid, errors: validationErrors } = validateForm(
      { password, confirmPassword },
      { password: true, confirmPassword: true }
    );

    if (!isValid) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError('Gagal memperbarui password: ' + updateError.message);
      } else {
        setMessage('Password berhasil diperbarui! Mengalihkan ke dashboard...');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
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
            <div className="flex flex-col gap-1">
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password Baru"
                  required
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl outline-none transition-all font-sans font-bold ${errors.password ? 'border-danger bg-danger/5' : 'border-text-dark focus:border-primary-blue'}`}
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
              {errors.password && <span className="text-[0.65rem] text-danger font-black uppercase ml-2">{errors.password}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <div className="relative">
                <i className="fa-solid fa-check-double absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Konfirmasi Password"
                  required
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl outline-none transition-all font-sans font-bold ${errors.confirmPassword ? 'border-danger bg-danger/5' : 'border-text-dark focus:border-primary-blue'}`}
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
              {errors.confirmPassword && <span className="text-[0.65rem] text-danger font-black uppercase ml-2">{errors.confirmPassword}</span>}
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
