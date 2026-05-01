import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGacha } from '../../hooks/useGacha';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

// Sub-components
import GachaRatesModal from '../../components/gacha/GachaRatesModal';
import GachaRollArea from '../../components/gacha/GachaRollArea';

export default function Gacha() {
  const { user, profile, fetchProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const {
    isFetching,
    isRollDisabled,
    countdown,
    flashClass,
    result,
    showRates,
    setShowRates,
    handleRoll,
  } = useGacha(user, profile, fetchProfile);
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  if (!profile) return null;

  return (
    <>
      {flashClass && <div className={`screen-flash ${flashClass}`}></div>}

      <Navbar />
      <main className="px-4 max-w-md mx-auto text-center pb-24">
        <div className="flex justify-center gap-2 mb-8">
          <div className="inline-flex items-center gap-2 bg-border-main text-bg-main px-4 py-2 rounded-xl font-bold border-2 border-primary-blue shadow-[4px_4px_0px_var(--color-secondary-yellow)]">
            <i className="fa-solid fa-dice"></i> Dadu: {profile.dice_count}
          </div>
          <button
            onClick={() => setShowRates(!showRates)}
            className="w-10 h-10 bg-card-bg border-2 border-border-main rounded-xl flex items-center justify-center shadow-[4px_4px_0px_var(--border)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            title="Info Rate"
          >
            <i className="fa-solid fa-circle-info text-primary-blue"></i>
          </button>
        </div>

        <GachaRatesModal
          isOpen={showRates}
          onClose={() => setShowRates(false)}
        />


        <GachaRollArea
          isFetching={isFetching}
          result={result}
          isRollDisabled={isRollDisabled}
          countdown={countdown}
          onRoll={handleRoll}
        />
      </main>
      <BottomNav />
    </>
  );
}
