export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonalTheme {
  name: string;
  game: string;
  description: string;
  colors: ThemeColors;
}

export interface ThemeColors {
  surfaceBase: string;       // page background
  surfaceRaised: string;     // elevated surface (inputs, panels)
  surfaceCard: string;       // card surface
  surfaceGlass: string;      // glassmorphism surface
  textBase: string;          // primary text
  textSecondary: string;     // secondary / muted text
  accentPrimary: string;     // main theme accent
  accentSecondary: string;   // secondary accent
  accentTertiary: string;    // tertiary accent
  accentSpecial: string;     // fourth accent
  borderAccent: string;      // accent border color (rgba string)
  borderSubtle: string;      // subtle border color (rgba string)
  borderGlass: string;       // glass panel border color
}

export const SEASONAL_THEMES: Record<Season, SeasonalTheme> = {
  spring: {
    name: 'Sky Pirates\' Dawn',
    game: 'FFXII',
    description: 'Vaan\'s journey and Dalmasca\'s liberation',
    colors: {
      surfaceBase: '#1a1a2e',
      surfaceRaised: '#2a2a3e',
      surfaceCard: '#222236',
      surfaceGlass: 'rgba(34, 34, 54, 0.9)',
      textBase: '#E6E6FA',
      textSecondary: '#DAA520',
      accentPrimary: '#5a9fd4',
      accentSecondary: '#DAA520',
      accentTertiary: '#8B4513',
      accentSpecial: '#E6E6FA',
      borderAccent: 'rgba(90, 159, 212, 0.5)',
      borderSubtle: 'rgba(218, 165, 32, 0.4)',
      borderGlass: 'rgba(70, 130, 180, 0.2)',
    },
  },
  summer: {
    name: 'Revolution\'s Dawn',
    game: 'FFXIV: Stormblood',
    description: 'Ala Mhigan fire and Doma\'s spirit',
    colors: {
      surfaceBase: '#010108',
      surfaceRaised: '#0a0808',
      surfaceCard: '#050404',
      surfaceGlass: 'rgba(5, 4, 4, 0.9)',
      textBase: '#D8C8A5',
      textSecondary: '#D8C8A5',
      accentPrimary: '#e63355',
      accentSecondary: '#D8C8A5',
      accentTertiary: '#AA906D',
      accentSpecial: '#2F2623',
      borderAccent: 'rgba(230,51,85,0.5)',
      borderSubtle: 'rgba(216, 200, 165, 0.4)',
      borderGlass: 'rgba(170, 27, 54, 0.33)',
    },
  },
  autumn: {
    name: 'Voidwalker',
    game: 'FFXIV: Shadowbringers',
    description: 'The First\'s light and Crystal Tower\'s power',
    colors: {
      surfaceBase: '#0a0a0a',
      surfaceRaised: '#1a1a1a',
      surfaceCard: '#151515',
      surfaceGlass: 'rgba(21, 21, 21, 0.9)',
      textBase: '#e0ae80',
      textSecondary: '#9395F8',
      accentPrimary: '#a46ae0',
      accentSecondary: '#9395F8',
      accentTertiary: '#e0ae80',
      accentSpecial: '#714c6c',
      borderAccent: 'rgba(164, 106, 224, 0.5)',
      borderSubtle: 'rgba(147, 149, 248, 0.4)',
      borderGlass: 'rgba(148, 87, 217, 0.2)',
    },
  },
  winter: {
    name: 'Holy Sanctum',
    game: 'FFXIV: Heavensward',
    description: 'Ishgardian faith and dragon fire',
    colors: {
      surfaceBase: '#070B0B',
      surfaceRaised: '#0f1414',
      surfaceCard: '#0a0f0f',
      surfaceGlass: 'rgba(10, 15, 15, 0.9)',
      textBase: '#E6F3FE',
      textSecondary: '#6BD6FB',
      accentPrimary: '#6BD6FB',
      accentSecondary: '#698FE4',
      accentTertiary: '#3B5EAB',
      accentSpecial: '#E6F3FE',
      borderAccent: 'rgba(107, 214, 251, 0.5)',
      borderSubtle: 'rgba(105, 143, 228, 0.4)',
      borderGlass: 'rgba(107, 214, 251, 0.2)',
    },
  },
};

export function getSeason(date: Date = new Date()): Season {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export function getThemeForSeason(season: Season): ThemeColors {
  return SEASONAL_THEMES[season].colors;
}
