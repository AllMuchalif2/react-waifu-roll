import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function BottomNav() {
  const { user } = useAuth();

  const navClass = ({ isActive }) =>
    `flex flex-col items-center text-[0.65rem] font-bold transition-all duration-300 no-underline ${
      isActive
        ? 'text-secondary-yellow scale-110 opacity-100'
        : 'text-white opacity-60'
    }`;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] h-[70px] bg-[#1a1a1a]/95 backdrop-blur-md rounded-[28px] flex justify-around items-center z-50 border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-colors duration-300">
      <NavLink to="/" className={navClass}>
        <i className="fa-solid fa-house text-xl mb-1"></i>
        <span>HOME</span>
      </NavLink>

      <NavLink to="/waifus" className={navClass}>
        <i className="fa-solid fa-heart text-xl mb-1"></i>
        <span>WAIFU</span>
      </NavLink>

      <NavLink
        to="/gacha"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-14 h-14 bg-primary-blue rounded-2xl border-4 border-[#1a1a1a] -translate-y-4 shadow-[0_10px_20px_rgba(0,123,255,0.4)] transition-all ${
            isActive
              ? 'bg-secondary-yellow text-[#1a1a1a] scale-110'
              : 'text-white'
          }`
        }
      >
        <i className="fa-solid fa-dice text-2xl"></i>
      </NavLink>

      <NavLink to="/rank" className={navClass}>
        <i className="fa-solid fa-trophy text-xl mb-1"></i>
        <span>RANK</span>
      </NavLink>

      {user ? (
        <NavLink to="/dashboard" className={navClass}>
          <i className="fa-solid fa-user text-xl mb-1"></i>
          <span>PLAYER</span>
        </NavLink>
      ) : (
        <NavLink to="/login" className={navClass}>
          <i className="fa-solid fa-circle-user text-xl mb-1"></i>
          <span>LOGIN</span>
        </NavLink>
      )}
    </nav>
  );
}
