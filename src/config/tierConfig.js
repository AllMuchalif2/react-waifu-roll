/**
 * Konfigurasi Tier Waifu
 * Memusatkan seluruh pengaturan visual dan label tier
 */

export const TIER_CONFIG = {
  C: {
    label: 'Common',
    color: 'bg-[#adb5bd]',
    textColor: 'text-white',
    shadow: 'shadow-[2px_2px_0px_#1a1a1a]',
  },
  B: {
    label: 'Uncommon',
    color: 'bg-[#51cf66]',
    textColor: 'text-white',
    shadow: 'shadow-[2px_2px_0px_#1a1a1a]',
  },
  A: {
    label: 'Rare+',
    color: 'bg-[#339af0]',
    textColor: 'text-white',
    shadow: 'shadow-[2px_2px_0px_#1a1a1a]',
  },
  R: {
    label: 'Rare',
    color: 'bg-[#cc5de8]',
    textColor: 'text-white',
    shadow: 'shadow-[2px_2px_0px_#1a1a1a]',
  },
  S: {
    label: 'Special',
    color: 'bg-[#f06595]',
    textColor: 'text-white',
    shadow: 'shadow-[2px_2px_0px_#1a1a1a]',
  },
  SR: {
    label: 'Super Rare',
    color: 'bg-[#ff6b6b]',
    textColor: 'text-white',
    shadow: 'shadow-[3px_3px_0px_#1a1a1a]',
  },
  SSR: {
    label: 'Super Special Rare',
    color: 'bg-[#ff922b]',
    textColor: 'text-white',
    shadow: 'shadow-[2px_2px_0px_#1a1a1a]',
  },
  UR: {
    label: 'Ultimate Rare',
    color: 'bg-[#fcc419]',
    textColor: 'text-[#1a1a1a]',
    shadow: 'shadow-[3px_3px_0px_#ff922b]',
  },
  LIMITED: {
    label: 'Limited (1/1)',
    color: 'bg-gradient-to-r from-[#ff6b6b] to-[#fcc419]',
    textColor: 'text-white',
    shadow: 'shadow-[4px_4px_0px_#1a1a1a]',
  }
};

/**
 * Mendapatkan class warna tier dengan fallback
 */
export const getTierClass = (tier) => {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.C;
  return `${config.color} ${config.textColor}`;
};

/**
 * Mendapatkan style lengkap tier
 */
export const getTierStyle = (tier) => {
  return TIER_CONFIG[tier] || TIER_CONFIG.C;
};
