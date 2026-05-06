export const SUCCESS_AUDIO_URL =
  'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3';
export const LIMITED_AUDIO_URL =
  'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3';

export const getFlashClassByTier = (tier) => {
  if (tier === 'SSR') return 'flash-ssr';
  if (tier === 'UR') return 'flash-ur';
  if (tier === 'LIMITED') return 'flash-limited';
  return '';
};

export const playGachaSound = (tier) => {
  if (['SSR', 'UR', 'LIMITED'].includes(tier)) {
    const url = tier === 'LIMITED' ? LIMITED_AUDIO_URL : SUCCESS_AUDIO_URL;
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch((e) => console.log('Audio play error:', e));
  }
};

export const getBestTier = (waifus) => {
  if (!Array.isArray(waifus)) return waifus?.tier || 'C';

  const tiersOrder = ['LIMITED', 'UR', 'SSR', 'SR', 'S', 'R', 'A', 'B', 'C'];
  const sorted = [...waifus].sort((a, b) => {
    return tiersOrder.indexOf(a.tier) - tiersOrder.indexOf(b.tier);
  });

  return sorted[0]?.tier || 'C';
};
