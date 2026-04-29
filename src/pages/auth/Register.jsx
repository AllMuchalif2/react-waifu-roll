import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Tambahkan baris ini
    if (username.length > 15) {
      setMessage('Gagal: Username maksimal 15 karakter!');
      setLoading(false);
      return;
    }

    // 1. Daftar ke Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMessage('Gagal: ' + authError.message);
    } else if (authData.user) {
      // 2. Buat profil publik dengan dadu awal
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: authData.user.id, username, coins: 0, dice_count: 10 }]);

      if (profileError)
        setMessage('Gagal membuat profil: ' + profileError.message);
      else navigate('/dashboard'); // Langsung lempar ke dashboard
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-sm mx-auto mt-10">
        <div className="card-neo">
          <h1 className="text-2xl mb-6 text-center text-primary-blue">
            Register
          </h1>
          {message && (
            <div className="mb-4 p-3 bg-secondary-yellow border-2 border-text-dark rounded-xl text-sm font-bold">
              {message}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              required
              className="p-3 border-2 border-text-dark rounded-xl outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Username (Max 15 char)"
              maxLength={15}
              required
              className="p-3 border-2 border-text-dark rounded-xl outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password (min 6 char)"
              required
              className="p-3 border-2 border-text-dark rounded-xl outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" disabled={loading} className="btn-neo mt-2">
              {loading ? 'Memproses...' : 'DAFTAR'}
            </button>
          </form>
          <div className="mt-4 text-center text-sm font-bold">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary-blue">
              Login di sini
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-text-dark hover:text-primary-blue transition-colors no-underline">
            <i className="fa-solid fa-arrow-left"></i> Kembali ke Home
          </Link>
        </div>
      </main>
    </>
  );
}
