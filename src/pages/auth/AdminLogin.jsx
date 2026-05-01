import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { validateEmail } from '../../lib/validation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrors({});

    if (!validateEmail(email)) {
      setErrors({ email: 'Format email tidak valid' });
      setLoading(false);
      return;
    }

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setMessage('Akses Ditolak: Email/Password salah.');
      } else if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role === 'admin') {
          navigate('/admin');
        } else {
          await supabase.auth.signOut();
          setMessage('Oopss! Kamu bukan Admin.');
        }
      }
    } catch (err) {
      setMessage('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-sm mx-auto mt-10">
        <div className="card-neo border-danger shadow-[6px_6px_0px_#ff1744]">
          <h1 className="text-2xl mb-6 text-center text-danger font-black uppercase">
            Admin Entry
          </h1>
          {message && (
            <div className="mb-4 p-3 bg-danger text-white border-2 border-text-dark rounded-xl text-xs font-bold">
              {message}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <input
                type="email"
                placeholder="Admin Email"
                required
                className={`p-3 border-2 rounded-xl outline-none transition-all ${errors.email ? 'border-danger bg-danger/5' : 'border-text-dark focus:border-danger'}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <span className="text-[0.65rem] text-danger font-black uppercase ml-2">{errors.email}</span>}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                className="w-full p-3 border-2 border-text-dark rounded-xl outline-none focus:border-danger font-sans font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-danger"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-neo btn-neo-danger mt-2"
            >
              <i className="fa-solid fa-lock-open"></i>{' '}
              {loading ? 'Checking...' : 'ACCESS PANEL'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
