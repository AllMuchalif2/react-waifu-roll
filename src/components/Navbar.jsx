import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="pt-8 pb-4 px-4 text-center relative max-w-3xl mx-auto">
      <Link
        to="/"
        className="flex items-center justify-center gap-2 text-text-main font-extrabold text-2xl no-underline"
      >
        <img src="/assets/img/logo.png" alt="MYBINI Logo" className="h-8" />
        <span>MYBINI</span>
      </Link>

      <button
        onClick={toggleTheme}
        className="absolute right-4 top-8 w-10 h-10 flex items-center justify-center border-2 border-border-main rounded-xl bg-card-bg shadow-[2px_2px_0px_var(--border)] active:translate-x-px active:translate-y-px active:shadow-none transition-all"
        aria-label="Toggle Theme"
      >
        <i
          className={`fa-solid ${
            theme === 'light'
              ? 'fa-moon text-primary-blue'
              : 'fa-sun text-secondary-yellow'
          }`}
        ></i>
      </button>
    </header>
  );
}
