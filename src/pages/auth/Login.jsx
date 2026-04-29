import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
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
            <input
              type="password"
              placeholder="Password"
              required
              className="p-3 border-2 border-text-dark rounded-xl outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" disabled={loading} className="btn-neo mt-2">
              {loading ? 'Masuk...' : 'LOGIN'}
            </button>
          </form>
          <div className="mt-4 text-center text-sm font-bold">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary-blue">
              Daftar sekarang
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
