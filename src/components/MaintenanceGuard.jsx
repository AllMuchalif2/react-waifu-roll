import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Outlet } from 'react-router-dom';

export default function MaintenanceGuard({ children }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'maintenance_mode')
          .single();

        if (!error && data?.value === 'true') {
          setIsMaintenance(true);
        }
      } catch (err) {
        console.error('Failed to check maintenance status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();

    const subscription = supabase
      .channel('public:app_settings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'app_settings',
          filter: 'key=eq.maintenance_mode',
        },
        (payload) => {
          setIsMaintenance(payload.new.value === 'true');
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Admins bypass maintenance mode
  if (isMaintenance && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-main p-6 text-center">
        <i className="fa-solid fa-person-digging text-6xl text-primary mb-6 animate-bounce"></i>
        <h1 className="text-3xl font-black uppercase italic mb-2 text-text-main">
          Under Maintenance
        </h1>
        <p className="text-text-muted font-bold mb-8 max-w-sm">
          Server sedang dalam perbaikan atau peningkatan sistem. Silakan kembali
          lagi nanti!
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-neo btn-neo-outline max-w-xs"
        >
          <i className="fa-solid fa-rotate-right mr-2"></i> CEK LAGI
        </button>
      </div>
    );
  }

  return <Outlet />;
}
