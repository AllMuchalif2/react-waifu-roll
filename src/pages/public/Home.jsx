import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import { animate as anime, stagger } from 'animejs';

export default function Home() {
  useEffect(() => {
    anime(
      '.stagger-item',
      {
        translateY: [30, 0],
        opacity: [0, 1],
        scale: [0.9, 1],
      },
      {
        delay: stagger(100),
        easing: 'spring(1, 80, 10, 0)',
        duration: 1200,
      },
    );

    anime(
      '.floating',
      {
        translateY: [-10, 10],
      },
      {
        direction: 'alternate',
        loop: true,
        easing: 'linear',
        duration: 2000,
      },
    );
  }, []);

  return (
    <>
      <Navbar />
      <main className="px-6 max-w-lg mx-auto flex flex-col gap-8 pb-32">
        {/* HERO SECTION */}
        <section className="stagger-item flex flex-col items-center text-center pt-6">
          <div className="relative mb-8 floating">
            <div className="absolute -inset-4 bg-primary-blue rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="w-32 h-32 bg-white rounded-[2rem] border-4 border-text-dark flex items-center justify-center p-4 shadow-[8px_8px_0px_#1a1a1a] relative z-10">
              <img
                src="/assets/img/logo.png"
                alt="MYBINI Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h1 className="text-4xl text-black italic uppercase tracking-tighter leading-none mb-4 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
            <span className="text-primary-blue">MYBINI</span> <br />
            <span className="text-text-main text-2xl opacity-50">
              GACHA WAIFU
            </span>
          </h1>

          <p className="text-sm font-bold text-text-muted leading-relaxed max-w-[280px] mb-8">
            Bukankah ini my??
          </p>

          <Link
            to="/gacha"
            className="btn-neo no-underline w-full py-4 text-lg group"
          >
            <i className="fa-solid fa-play-circle mr-2 group-hover:rotate-12 transition-transform"></i>
            MULAI GACHA SEKARANG
          </Link>
        </section>

        {/* FEATURE CARDS */}
        <section className="grid grid-cols-1 gap-4">
          <div className="stagger-item card-neo bg-secondary-yellow p-5 group hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl border-2 border-text-dark flex items-center justify-center text-xl shadow-[4px_4px_0px_#1a1a1a]">
                <i className="fa-solid fa-heart text-danger"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-black uppercase text-sm italic">
                  Koleksi Luas
                </h3>
                <p className="text-black text-[0.65rem] font-bold opacity-70">
                  Ratusan karakter dari berbagai anime populer.
                </p>
              </div>
            </div>
          </div>

          <div className="stagger-item card-neo bg-primary-blue text-white p-5 group hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl border-2 border-text-dark flex items-center justify-center text-xl shadow-[4px_4px_0px_#1a1a1a] text-text-dark">
                <i className="fa-solid fa-trophy text-secondary-yellow"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-black uppercase text-sm italic">
                  Sistem Rank
                </h3>
                <p className="text-black text-[0.65rem] font-bold opacity-80">
                  Bersaing dengan pemain lain untuk koleksi terbaik.
                </p>
              </div>
            </div>
          </div>

          <div className="stagger-item card-neo bg-white p-5 group hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl border-2 border-text-dark flex items-center justify-center text-xl shadow-[4px_4px_0px_#1a1a1a] text-text-dark">
                <i className="fa-solid fa-clock-rotate-left text-primary-blue"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-black uppercase text-sm italic">
                  Update Rutin
                </h3>
                <p className="text-black text-[0.65rem] font-bold opacity-60">
                  Daftar waifu di pool selalu diperbarui tiap minggu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="stagger-item card-neo bg-text-dark text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-blue opacity-20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <h2 className="text-xl text-text-main italic uppercase mb-3">
            Siap Menjadi Legend?
          </h2>
          <p className="text-xs text-text-main opacity-70 mb-6 font-bold">
            Dapatkan waifu LIMITED 1/1 dan tunjukkan pada dunia!
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/waifus"
              className="btn-neo btn-neo-secondary no-underline py-3 text-xs"
            >
              <i className="fa-solid fa-search mr-2"></i> LIHAT DAFTAR WAIFU
            </Link>
            <Link
              to="/rank"
              className="btn-neo btn-neo-primary no-underline py-3 text-xs"
            >
              <i className="fa-solid fa-medal mr-2"></i> CEK SCOREBOARD
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="stagger-item text-center mt-4">
          <p className="text-[0.7rem] text-text-main uppercase tracking-widest">
            &copy; 2026 MYBINI - IG:{' '}
            <a
              href="https://instagram.com/allmuchalif2"
              target="_blank"
              className="no-underline hover:text-primary-blue transition-all"
            >
              @AllMuchalif2
            </a>
          </p>
        </footer>
      </main>
      <BottomNav />
    </>
  );
}
