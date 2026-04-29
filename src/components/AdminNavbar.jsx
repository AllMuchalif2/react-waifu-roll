import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navClass = (path) =>
    `px-3 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
      location.pathname === path
        ? 'bg-primary-blue text-white shadow-[2px_2px_0px_#1a1a1a]'
        : 'text-text-muted hover:bg-gray-100'
    }`;

  return (
    <nav className="bg-white border-b-4 border-text-dark sticky top-0 z-[100] px-4 py-3 mb-6">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="no-underline">
            <span className="font-black italic text-lg text-danger">ADMIN.</span>
          </Link>
          
          <div className="hidden sm:flex gap-2">
            <Link to="/admin" className={navClass('/admin')}>
              Stats
            </Link>
            <Link to="/admin/waifus" className={navClass('/admin/waifus')}>
              Waifus
            </Link>
            <Link to="/admin/suggestions" className={navClass('/admin/suggestions')}>
              Saran
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="text-[0.65rem] font-bold text-primary-blue no-underline border-b border-primary-blue">
            Ke Player
          </Link>
          <button
            onClick={handleLogout}
            className="ml-2 bg-danger/10 text-danger border-2 border-danger px-3 py-1 rounded-lg text-[0.65rem] font-black uppercase hover:bg-danger hover:text-white transition-all shadow-[2px_2px_0px_#1a1a1a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* Mobile Nav Links */}
      <div className="flex sm:hidden justify-around mt-3 pt-3 border-t border-gray-100">
        <Link to="/admin" className={navClass('/admin')}>
          Dashboard
        </Link>
        <Link to="/admin/waifus" className={navClass('/admin/waifus')}>
          Waifus
        </Link>
        <Link to="/admin/suggestions" className={navClass('/admin/suggestions')}>
          Saran
        </Link>
      </div>
    </nav>
  );
}
