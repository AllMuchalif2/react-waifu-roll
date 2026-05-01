import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import ConfirmModal from '../../components/ConfirmModal';

// Sub-components
import ProfileHeader from '../../components/dashboard/ProfileHeader';
import DashboardStats from '../../components/dashboard/DashboardStats';
import ActionLinks from '../../components/dashboard/ActionLinks';
import InventoryFilters from '../../components/dashboard/InventoryFilters';
import InventoryGrid from '../../components/dashboard/InventoryGrid';
import SellWaifuModal from '../../components/dashboard/SellWaifuModal';
import BuyDiceModal from '../../components/dashboard/BuyDiceModal';

export default function PlayerDashboard() {
  const { user, profile, fetchProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showBulkSellConfirm, setShowBulkSellConfirm] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'primary' });

  const {
    loading,
    search,
    setSearch,
    tierFilter,
    setTierFilter,
    sellingWaifu,
    setSellingWaifu,
    sellAmount,
    setSellAmount,
    isBuyingDice,
    setIsBuyingDice,
    buyAmount,
    setBuyAmount,
    selectedPoolIds,
    setSelectedPoolIds,
    toggleSelectPoolId,
    confirmBulkSell,
    calculateBulkSellInfo,
    filteredInventory,
    handleDailyClaim,
    confirmBuyDice,
    handleSell,
    confirmSell,
  } = useDashboardData(user, profile, fetchProfile);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  const handleBuyDiceWithModal = async () => {
    const result = await confirmBuyDice();
    if (result?.error) {
      setAlertConfig({
        isOpen: true,
        title: 'Gagal Membeli',
        message: result.error,
        type: 'danger'
      });
    }
  };

  const bulkSellInfo = calculateBulkSellInfo();

  if (authLoading || !profile)
    return <div className="text-center mt-20 font-bold">Memuat Profil...</div>;

  return (
    <>
      <Navbar />
      <main className="px-4 max-w-3xl mx-auto pb-24">
        <div className="card-neo mb-6 bg-text-dark text-text-main border-primary-blue shadow-[6px_6px_0px_#3d5afe]">
          <ProfileHeader user={user} profile={profile} />
          <DashboardStats
            profile={profile}
            onBuyDice={() => setIsBuyingDice(true)}
            onDailyClaim={handleDailyClaim}
          />
        </div>

        <ActionLinks isAdmin={profile.role === 'admin'} />

        <InventoryFilters
          search={search}
          setSearch={setSearch}
          tierFilter={tierFilter}
          setTierFilter={setTierFilter}
          isSelectionMode={isSelectionMode}
          onToggleSelectionMode={() => {
            setIsSelectionMode(!isSelectionMode);
            setSelectedPoolIds([]);
          }}
          selectedCount={selectedPoolIds.length}
          onBulkSell={() => setShowBulkSellConfirm(true)}
        />

        <InventoryGrid
          inventory={filteredInventory}
          loading={loading}
          onSell={handleSell}
          isSelectionMode={isSelectionMode}
          selectedPoolIds={selectedPoolIds}
          onToggleSelection={toggleSelectPoolId}
        />
      </main>

      <SellWaifuModal
        waifu={sellingWaifu}
        sellAmount={sellAmount}
        setSellAmount={setSellAmount}
        onConfirm={confirmSell}
        onCancel={() => setSellingWaifu(null)}
      />

      <BuyDiceModal
        isOpen={isBuyingDice}
        buyAmount={buyAmount}
        setBuyAmount={setBuyAmount}
        coins={profile.coins}
        onConfirm={handleBuyDiceWithModal}
        onCancel={() => setIsBuyingDice(false)}
      />

      {/* Bulk Sell Confirm Modal */}
      <ConfirmModal
        isOpen={showBulkSellConfirm}
        title="Konfirmasi Bulk Sell"
        message={`Apakah Anda yakin ingin menjual ${bulkSellInfo.totalUnits} unit waifu dari ${selectedPoolIds.length} jenis berbeda? Anda akan mendapatkan ${bulkSellInfo.totalEarned} koin.`}
        confirmText="Ya, Jual Semua"
        type="danger"
        onConfirm={() => {
          confirmBulkSell();
          setShowBulkSellConfirm(false);
          setIsSelectionMode(false);
        }}
        onCancel={() => setShowBulkSellConfirm(false)}
      />

      {/* General Alert Modal */}
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

      <BottomNav />
    </>
  );
}
