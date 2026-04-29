import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function BottomNav() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Fungsi utilitas untuk styling state aktif
  const navClass = ({ isActive }) =>
    `flex flex-col items-center text-[0.7rem] font-medium opacity-70 transition-opacity duration-200 no-underline text-white ${
      isActive ? 'opacity-100 text-secondary-yellow' : ''
    }`;

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[440px] h-[70px] bg-text-dark rounded-[24px] flex justify-around items-center z-50 shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
      <NavLink to="/" className={navClass}>
        <i className="fa-solid fa-house text-2xl mb-1"></i>
        <span>Home</span>
      </NavLink>
      <NavLink to="/roll" className={navClass}>
        <i className="fa-solid fa-dice text-2xl mb-1"></i>
        <span>Roll</span>
      </NavLink>
      <NavLink to="/pool" className={navClass}>
        <i className="fa-solid fa-list text-2xl mb-1"></i>
        <span>Pool</span>
      </NavLink>
      <NavLink to="/dashboard" className={navClass}>
        <i className="fa-solid fa-heart text-2xl mb-1"></i>
        <span>Collection</span>
      </NavLink>

      {user ? (
        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-[0.7rem] font-medium opacity-70 transition-opacity duration-200 text-white bg-transparent border-none cursor-pointer hover:opacity-100"
        >
          <i className="fa-solid fa-right-from-bracket text-2xl mb-1"></i>
          <span>Logout</span>
        </button>
      ) : (
        <NavLink to="/login" className={navClass}>
          <i className="fa-solid fa-user text-2xl mb-1"></i>
          <span>Login</span>
        </NavLink>
      )}
    </nav>
  );
}
