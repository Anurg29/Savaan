export type Season = 'barish' | 'garmi' | 'sardi';

export interface SeasonConfig {
  id: Season;
  label: string;
  emoji: string;
  backgroundImage: string;
  theme: {
    bgColor: string;
    textColor: string;
    primary: string;
    accent: string;
    glow: string;
  };
}

export const SEASONS: Record<Season, SeasonConfig> = {
  barish: {
    id: 'barish',
    label: 'Barish',
    emoji: '🌧️',
    backgroundImage: '/scenes/image.jpeg',
    theme: {
      bgColor: '#1a2436',
      textColor: '#e2e8f0',
      primary: '#4a6c8a',
      accent: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.15)',
    },
  },
  garmi: {
    id: 'garmi',
    label: 'Garmi',
    emoji: '☀️',
    backgroundImage: '/scenes/garmi.webp',
    theme: {
      bgColor: '#2c1810',
      textColor: '#fdf5e6',
      primary: '#c97a55',
      accent: '#d4af37',
      glow: 'rgba(212, 175, 55, 0.15)',
    },
  },
  sardi: {
    id: 'sardi',
    label: 'Sardi',
    emoji: '❄️',
    backgroundImage: '/scenes/sardi.webp',
    theme: {
      bgColor: '#0b1320',
      textColor: '#f1f5f9',
      primary: '#f97316',
      accent: '#fcd34d',
      glow: 'rgba(252, 211, 77, 0.15)',
    },
  },
};

export interface Track {
  title: string;
  artist: string;
  audioUrl: string;
  coverArt?: string;
  type?: 'youtube' | 'local';
}
