import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="pt-8 pb-4 px-4 text-center">
      <Link
        to="/"
        className="flex items-center justify-center gap-2 text-text-dark font-extrabold text-2xl no-underline"
      >
        <img src="/assets/img/logo.png" alt="MYBINI Logo" className="h-8" />
        <span>MYBINI</span>
      </Link>
    </header>
  );
}
