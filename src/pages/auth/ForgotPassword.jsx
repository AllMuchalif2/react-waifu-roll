import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError('Gagal mengirim email reset: ' + error.message);
    } else {
      setMessage('Instruksi reset password telah dikirim ke email Anda.');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-sm mx-auto mt-10">
        <div className="card-neo bg-white animate-fade-in">
          <h1 className="text-2xl font-black uppercase italic mb-2 text-center text-primary-blue">
            Lupa Password?
          </h1>
          <p className="text-center text-xs font-bold text-text-muted mb-6">
            Masukkan email Anda untuk menerima link reset password.
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

          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div className="relative">
              <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
              <input
                type="email"
                placeholder="Email Akun Anda"
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-text-dark rounded-xl outline-none focus:border-primary-blue font-sans font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-neo mt-2 w-full py-3"
            >
              {loading ? (
                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
              ) : (
                <i className="fa-solid fa-paper-plane mr-2"></i>
              )}
              {loading ? 'Mengirim...' : 'KIRIM INSTRUKSI'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs font-black">
            Ingat password Anda?{' '}
            <Link to="/login" className="text-primary-blue uppercase hover:underline">
              Kembali Login
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
