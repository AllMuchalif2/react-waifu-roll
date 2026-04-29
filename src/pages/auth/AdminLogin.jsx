import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage('Akses Ditolak: Email/Password salah.');
    } else {
      // Cek apakah user adalah admin di tabel profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        navigate('/admin');
      } else {
        await supabase.auth.signOut();
        setMessage('Oopss! Kamu bukan Admin.');
      }
    }
    setLoading(false);
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
            <input
              type="email"
              placeholder="Admin Email"
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
