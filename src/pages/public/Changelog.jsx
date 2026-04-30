import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import { supabase } from '../../lib/supabase';

export default function Changelog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('waifu_changelogs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  const getActionStyle = (action) => {
    switch (action) {
      case 'ADD':
        return 'bg-success/10 text-success border-success';
      case 'DELETE':
        return 'bg-danger/10 text-danger border-danger';
      case 'UPDATE':
        return 'bg-primary-blue/10 text-primary-blue border-primary-blue';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-2xl mx-auto pb-24">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-black italic uppercase drop-shadow-sm">
            Waifu Changelog
          </h1>
          <p className="text-text-muted text-sm mt-2">
            Riwayat pembaruan pool waifu secara otomatis.
          </p>
        </header>

        {loading ? (
          <div className="text-center py-10 animate-pulse font-bold">
            Memuat riwayat...
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="card-neo flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`px-2 py-1 rounded-md text-[0.6rem] font-black border uppercase ${getActionStyle(log.action)}`}
                  >
                    {log.action}
                  </div>
                  <div>
                    <div className="text-sm font-black">{log.waifu_name}</div>
                    <div className="text-[0.7rem] text-text-muted">
                      {log.details}
                    </div>
                  </div>
                </div>
                <div className="text-[0.65rem] opacity-50 font-mono text-right">
                  {new Date(log.created_at).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="text-center py-20 text-text-muted italic border-2 border-dashed border-text-dark/10 rounded-2xl">
                Belum ada riwayat pembaruan.
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
