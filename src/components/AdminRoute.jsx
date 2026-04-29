import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="text-center mt-20 font-bold uppercase tracking-widest animate-pulse">Verifying Admin Access...</div>;

  // Jika tidak login atau role bukan admin, tendang ke admin-login
  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
