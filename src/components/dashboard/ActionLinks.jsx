import { Link } from 'react-router-dom';

export default function ActionLinks({ isAdmin }) {
  return (
    <div className="grid grid-cols-4 gap-2 mb-8">
      <Link to="/history" className="btn-neo no-underline text-[0.55rem] px-1">
        <i className="fa-solid fa-clock-rotate-left"></i> Riwayat
      </Link>

      <Link to="/album" className="btn-neo btn-neo-outline no-underline text-[0.55rem] px-1">
        <i className="fa-solid fa-book"></i> Album
      </Link>

      <Link
        to="/suggestions"
        className="btn-neo btn-neo-secondary no-underline text-[0.55rem] px-1"
      >
        <i className="fa-solid fa-lightbulb"></i> Saran
      </Link>

      {isAdmin && (
        <Link
          to="/admin"
          className="btn-neo btn-neo-danger no-underline text-[0.55rem] px-1"
        >
          <i className="fa-solid fa-user-gear"></i> Admin
        </Link>
      )}
    </div>
  );
}
