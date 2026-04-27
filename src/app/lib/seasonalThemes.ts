export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonalTheme {
  name: string;
  game: string;
  description: string;
  colors: ThemeColors;
}

export interface ThemeColors {
  bg: string;
  bgElev: string;
  card: string;
  muted: string;
  text: string;
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  accentQuaternary: string;
  borderPrimary: string;
  borderSecondary: string;
  glassBorder: string;
  glassBg: string;
}

export const SEASONAL_THEMES: Record<Season, SeasonalTheme> = {
  spring: {
    name: 'Sky Pirates\' Dawn',
    game: 'FFXII',
    description: 'Vaan\'s journey and Dalmasca\'s liberation',
    colors: {
      bg: '#1a1a2e',
      bgElev: '#2a2a3e',
      card: '#222236',
      muted: '#DAA520',
      text: '#E6E6FA',
      accentPrimary: '#4682B4',
      accentSecondary: '#DAA520',
      accentTertiary: '#8B4513',
      accentQuaternary: '#E6E6FA',
      borderPrimary: 'rgba(70, 130, 180, 0.5)',
      borderSecondary: 'rgba(218, 165, 32, 0.4)',
      glassBorder: 'rgba(70, 130, 180, 0.2)',
      glassBg: 'rgba(34, 34, 54, 0.9)',
    },
  },
  summer: {
    name: 'Revolution\'s Dawn',
    game: 'FFXIV: Stormblood',
    description: 'Ala Mhigan fire and Doma\'s spirit',
    colors: {
      bg: '#010108',
      bgElev: '#0a0808',
      card: '#050404',
      muted: '#D8C8A5',
      text: '#D8C8A5',
      accentPrimary: '#aa1b36',
      accentSecondary: '#D8C8A5',
      accentTertiary: '#AA906D',
      accentQuaternary: '#2F2623',
      borderPrimary: 'rgba(170,27,54,0.5)',
      borderSecondary: 'rgba(216, 200, 165, 0.4)',
      glassBorder: 'rgba(170, 27, 54, 0.33)',
      glassBg: 'rgba(5, 4, 4, 0.9)',
    },
  },
  autumn: {
    name: 'Voidwalker',
    game: 'FFXIV: Shadowbringers',
    description: 'The First\'s light and Crystal Tower\'s power',
    colors: {
      bg: '#0a0a0a',
      bgElev: '#1a1a1a',
      card: '#151515',
      muted: '#9395F8',
      text: '#e0ae80',
      accentPrimary: '#9457d9',
      accentSecondary: '#9395F8',
      accentTertiary: '#e0ae80',
      accentQuaternary: '#714c6c',
      borderPrimary: 'rgba(148, 87, 217, 0.5)',
      borderSecondary: 'rgba(147, 149, 248, 0.4)',
      glassBorder: 'rgba(148, 87, 217, 0.2)',
      glassBg: 'rgba(21, 21, 21, 0.9)',
    },
  },
  winter: {
    name: 'Holy Sanctum',
    game: 'FFXIV: Heavensward',
    description: 'Ishgardian faith and dragon fire',
    colors: {
      bg: '#070B0B',
      bgElev: '#0f1414',
      card: '#0a0f0f',
      muted: '#6BD6FB',
      text: '#E6F3FE',
      accentPrimary: '#6BD6FB',
      accentSecondary: '#698FE4',
      accentTertiary: '#3B5EAB',
      accentQuaternary: '#E6F3FE',
      borderPrimary: 'rgba(107, 214, 251, 0.5)',
      borderSecondary: 'rgba(105, 143, 228, 0.4)',
      glassBorder: 'rgba(107, 214, 251, 0.2)',
      glassBg: 'rgba(10, 15, 15, 0.9)',
    },
  },
};

export function getSeason(date: Date = new Date()): Season {
  const month = date.getMonth(); // 0-11
  
  // Spring: March (2), April (3), May (4)
  if (month >= 2 && month <= 4) return 'spring';
  
  // Summer: June (5), July (6), August (7)
  if (month >= 5 && month <= 7) return 'summer';
  
  // Autumn: September (8), October (9), November (10)
  if (month >= 8 && month <= 10) return 'autumn';
  
  // Winter: December (11), January (0), February (1)
  return 'winter';
}

export function getThemeForSeason(season: Season): ThemeColors {
  return SEASONAL_THEMES[season].colors;
}
