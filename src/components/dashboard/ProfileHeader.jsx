import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function ProfileHeader({ user, profile }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-2xl text-primary-blue font-bold">
          {profile.username}
        </h2>
        <p className="text-xs opacity-70 font-mono mt-1">
          {user.email} | {profile.role === 'admin' && 'ADMIN'}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={handleLogout}
          className="text-[0.6rem] bg-secondary-yellow/10 hover:bg-secondary-yellow/20 px-2 py-1 rounded-md transition-colors border border-white/20 uppercase font-black tracking-tighter"
        >
          <i className="fa-solid fa-right-from-bracket mr-1"></i>
          Keluar
        </button>
      </div>
    </div>
  );
}
