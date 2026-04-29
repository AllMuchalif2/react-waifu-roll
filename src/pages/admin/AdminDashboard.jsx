import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function AdminDashboard() {
  return (
    <>
      <Navbar />
      <main className="px-4 max-w-md mx-auto flex flex-col gap-6 text-center mt-4">
        <div className="card-neo">
          <div className="flex justify-center mb-2">
            <i className="fa-solid fa-user-shield text-4xl text-danger"></i>
          </div>
          <h1 className="text-2xl mb-4 text-text-dark">Admin Panel</h1>
          <p className="text-text-muted mb-6 font-medium">
            Kelola data master MYBINI dan tambahkan waifu baru ke dalam pool.
          </p>

          <Link
            to="/admin/waifus"
            className="btn-neo btn-neo-danger no-underline"
          >
            <i className="fa-solid fa-database text-xl"></i> KELOLA WAIFU
          </Link>
        </div>

        <Link
          to="/"
          className="text-text-muted font-bold no-underline hover:text-primary-blue transition-colors"
        >
          &larr; Kembali ke Beranda
        </Link>
      </main>
    </>
  );
}
