import { useState } from 'react';
import { useAdminSuggestions } from '../../hooks/useAdminSuggestions';
import AdminNavbar from '../../components/AdminNavbar';
import SuggestionCard from '../../components/admin/SuggestionCard';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminSuggestions() {
  const { suggestions, loading, filter, setFilter, handleUpdateStatus } =
    useAdminSuggestions();

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'primary',
  });
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    suggestion: null,
    newStatus: '',
  });

  const onUpdateStatusClick = (suggestion, newStatus) => {
    setConfirmConfig({
      isOpen: true,
      suggestion,
      newStatus,
    });
  };

  const executeUpdate = async () => {
    const { suggestion, newStatus } = confirmConfig;
    setConfirmConfig({ ...confirmConfig, isOpen: false });

    const result = await handleUpdateStatus(suggestion, newStatus);
    if (result?.error) {
      setAlertConfig({
        isOpen: true,
        title: 'Error',
        message: result.error,
        type: 'danger',
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg-main">
      <AdminNavbar />
      <main className="px-4 max-w-5xl mx-auto pb-20 transition-colors duration-300">
        <header className="mb-8 mt-4">
          <h1 className="text-2xl font-black uppercase italic text-text-main">
            Manajemen Saran Waifu
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Validasi masukan dari pemain untuk menambah waifu pool.
          </p>
        </header>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl border-2 border-border-main font-black text-[0.65rem] uppercase transition-all shadow-[3px_3px_0px_var(--border)] active:translate-x-px active:translate-y-px active:shadow-none ${
                filter === s
                  ? 'bg-secondary-yellow text-[#1a1a1a]'
                  : 'bg-card-bg text-text-muted'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 font-bold animate-pulse text-lg text-text-main">
            Memuat saran...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((s) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                onUpdateStatus={onUpdateStatusClick}
              />
            ))}

            {suggestions.length === 0 && (
              <div className="col-span-full text-center py-20 text-text-muted italic opacity-50">
                Tidak ada saran dalam kategori ini.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title="Konfirmasi Status"
        message={`Apakah Anda yakin ingin mengubah status saran ini menjadi ${confirmConfig.newStatus}?`}
        confirmText="Ya, Update"
        onConfirm={executeUpdate}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {/* Alert Modal */}
      <ConfirmModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText="OK"
        cancelText=""
        onConfirm={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        onCancel={() => setAlertConfig({ ...alertConfig, isOpen: false })}
      />
    </div>
  );
}
