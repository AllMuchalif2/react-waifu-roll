export const TIER_CONFIG = {
  C: {
    label: 'Common',
    color: 'bg-[#adb5bd]',
    textColor: 'text-white',
    shadow: 'shadow-[2px_2px_0px_var(--border)]',
  },
  B: {
    label: 'Uncommon',
    color: 'bg-[#51cf66]',
    textColor: 'text-white',
    shadow: 'shadow-[2px_2px_0px_var(--border)]',
  },
  A: {
    label: 'Rare+',
    color: 'bg-[#339af0]',
    textColor: 'text-white',
    shadow: 'shadow-[2px_2px_0px_var(--border)]',
  },
  R: {
    label: 'Rare',
    color: 'bg-[#cc5de8]',
    textColor: 'text-white',
    shadow: 'shadow-[2px_2px_0px_var(--border)]',
  },
  S: {
    label: 'Special',
    color: 'bg-[#f06595]',
    textColor: 'text-white',
    shadow: 'shadow-[2px_2px_0px_var(--border)]',
  },
  SR: {
    label: 'Super Rare',
    color: 'bg-[#ff6b6b]',
    textColor: 'text-white',
    shadow: 'shadow-[3px_3px_0px_var(--border)]',
  },
  SSR: {
    label: 'Super Special Rare',
    color: 'bg-[#ff922b]',
    textColor: 'text-white',
    shadow: 'shadow-[2px_2px_0px_var(--border)]',
  },
  UR: {
    label: 'Ultimate Rare',
    color: 'bg-[#fcc419]',
    textColor: 'text-text-main',
    shadow: 'shadow-[3px_3px_0px_#ff922b]',
  },
  LIMITED: {
    label: 'Limited (1/1)',
    color: 'bg-gradient-to-r from-[#ff6b6b] to-[#fcc419]',
    textColor: 'text-white',
    shadow: 'shadow-[4px_4px_0px_var(--border)]',
  },
};

export const getTierClass = (tier) => {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.C;
  return `${config.color} ${config.textColor}`;
};

export const getTierStyle = (tier) => {
  return TIER_CONFIG[tier] || TIER_CONFIG.C;
};
