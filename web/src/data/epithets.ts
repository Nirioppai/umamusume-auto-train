import epithetsJson from '@constants/epithets.json';

type EpithetEntry = { color: string; races: string[] };

const EPITHETS = epithetsJson as Record<string, EpithetEntry>;

export const EPITHET_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(EPITHETS).map(([name, { color }]) => [name, color]),
);

export const RACE_EPITHET_MAP: Record<string, string> = Object.entries(
  EPITHETS,
).reduce(
  (acc, [epithet, { races }]) => {
    races.forEach(race => {
      acc[race] = epithet;
    });
    return acc;
  },
  {} as Record<string, string>,
);
