import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="px-4 max-w-md mx-auto flex flex-col gap-6 text-center">
        {/* Banner Utama */}
        <div className="card-neo">
          <h1 className="text-3xl mb-2 text-primary-blue">
            Welcome to MYBINI!
          </h1>
          <p className="text-text-muted mb-6 font-medium">
            Gacha waifu impianmu sekarang juga dan kumpulkan tier tertinggi.
          </p>
          <Link to="/gacha" className="btn-neo no-underline">
            <i className="fa-solid fa-dice text-xl"></i> ROLL GACHA
          </Link>
        </div>

        {/* Info Pool */}
        <div className="card-neo bg-secondary-yellow border-text-dark">
          <h2 className="text-xl mb-2">Lihat Koleksi Waifu</h2>
          <p className="text-sm mb-4 text-text-dark opacity-80 font-medium">
            Cek daftar waifu yang saat ini tersedia di dalam mesin gacha.
          </p>
          <Link
            to="/waifus"
            className="btn-neo btn-neo-secondary no-underline border-text-dark"
          >
            <i className="fa-solid fa-list text-xl"></i> LIHAT WAIFU
          </Link>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
