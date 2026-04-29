import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setMessage('Login gagal! Periksa email dan password.');
    else navigate('/dashboard'); // Lempar ke dashboard jika sukses

    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-sm mx-auto mt-10">
        <div className="card-neo">
          <h1 className="text-2xl mb-6 text-center text-primary-blue">Login</h1>
          {message && (
            <div className="mb-4 p-3 bg-danger text-white border-2 border-text-dark rounded-xl text-sm font-bold">
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              required
              className="p-3 border-2 border-text-dark rounded-xl outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                className="w-full p-3 border-2 border-text-dark rounded-xl outline-none focus:border-primary-blue font-sans font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary-blue"
              >
                <i
                  className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                ></i>
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-neo mt-2">
              {loading ? 'Masuk...' : 'LOGIN'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-[0.65rem] font-bold text-text-muted hover:text-primary-blue no-underline uppercase tracking-wider"
            >
              Lupa password?
            </Link>
          </div>
          <div className="mt-4 text-center text-sm font-bold">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary-blue">
              Daftar sekarang
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-text-dark hover:text-primary-blue transition-colors no-underline"
          >
            <i className="fa-solid fa-arrow-left"></i> Kembali ke Home
          </Link>
        </div>
      </main>
    </>
  );
}
