// Konfigurasi Gacha & Ekonomi Game
// File ini memusatkan seluruh angka penting agar mudah diatur (Balancing)

export const DROP_RATES = [
  { tier: 'LIMITED', chance: 0.01, label: 'Limited (1/1)' },
  { tier: 'UR', chance: 0.19, label: 'Ultimate Rare' },
  { tier: 'SSR', chance: 0.8, label: 'Super Special Rare' },
  { tier: 'SR', chance: 2.0, label: 'Super Rare' },
  { tier: 'S', chance: 4.0, label: 'Special' },
  { tier: 'R', chance: 8.0, label: 'Rare' },
  { tier: 'A', chance: 15.0, label: 'Rare+' },
  { tier: 'B', chance: 30.0, label: 'Uncommon' },
  { tier: 'C', chance: 40.0, label: 'Common' },
];

export const PRICE_MAP = {
  C: 100,
  B: 150,
  A: 200,
  R: 250,
  S: 300,
  SR: 350,
  SSR: 400,
  UR: 450,
  LIMITED: 500,
};

export const DICE_PRICE = 100; // Harga 1 dadu dalam koin
export const DAILY_DICE_REWARD = 10; // Jumlah dadu dari klaim harian
