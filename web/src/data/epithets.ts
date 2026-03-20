export const EPITHETS: Record<string, string[]> = {
  'Classic Triple Crown': [
    'Satsuki Sho',
    'Tokyo Yushun Japanese Derby',
    'Kikuka Sho',
  ],
  'Triple Tiara': ['Oka Sho', 'Japanese Oaks', 'Shuka Sho'],
  'Senior Spring Triple Crown': [
    'Osaka Hai',
    'Tenno Sho Spring',
    'Takarazuka Kinen',
  ],
  'Senior Autumn Triple Crown': [
    'Tenno Sho Autumn',
    'Japan Cup',
    'Arima Kinen',
  ],
};

export const RACE_EPITHET_MAP: Record<string, string> = Object.entries(
  EPITHETS,
).reduce(
  (acc, [epithet, races]) => {
    races.forEach(race => {
      acc[race] = epithet;
    });
    return acc;
  },
  {} as Record<string, string>,
);
