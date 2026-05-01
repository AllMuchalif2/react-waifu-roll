import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main p-4 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-10 left-10 text-9xl font-black opacity-5 select-none -rotate-12">404</div>
      <div className="absolute bottom-10 right-10 text-9xl font-black opacity-5 select-none rotate-12">LOST</div>

      <div className="card-neo max-w-lg w-full text-center p-12 bg-white relative z-10 border-4 border-text-dark shadow-[12px_12px_0px_#1a1a1a]">
        <div className="text-primary-blue mb-6">
          <i className="fa-solid fa-map-location-dot text-8xl animate-bounce"></i>
        </div>
        
        <h1 className="text-6xl font-black mb-4 uppercase italic tracking-tighter text-[#1a1a1a]">
          404 <span className="text-danger">!!</span>
        </h1>
        
        <h2 className="text-2xl font-black mb-6 uppercase text-[#1a1a1a]">
          Kesasar Ya?
        </h2>
        
        <p className="text-gray-600 mb-10 font-bold text-lg leading-relaxed">
          Halaman yang kamu cari sepertinya sedang kencan dengan waifu lain atau memang tidak pernah ada.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-neo no-underline px-8 py-4">
            <i className="fa-solid fa-house mr-2"></i> KEMBALI KE HOME
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="btn-neo btn-neo-outline no-underline px-8 py-4"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> BALIK LAGI
          </button>
        </div>
      </div>
    </div>
  );
}
