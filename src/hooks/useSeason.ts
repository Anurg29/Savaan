import { useState, useEffect, useCallback } from 'react';
import { type Season, SEASONS } from '../types';

export function useSeason() {
  const [season, setSeason] = useState<Season>(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('season');
    if (s === 'rain' || s === 'barish') return 'barish';
    if (s === 'summer' || s === 'garmi') return 'garmi';
    if (s === 'winter' || s === 'sardi') return 'sardi';
    return 'barish';
  });

  // Apply theme CSS variables when season changes
  useEffect(() => {
    const config = SEASONS[season];
    const root = document.documentElement;
    root.style.setProperty('--bg-color', config.theme.bgColor);
    root.style.setProperty('--text-color', config.theme.textColor);
    root.style.setProperty('--primary', config.theme.primary);
    root.style.setProperty('--accent', config.theme.accent);
    root.style.setProperty('--glow', config.theme.glow);
  }, [season]);

  // Sync URL
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('season', season);
    window.history.replaceState({}, '', url.toString());
  }, [season]);

  // Preload adjacent scene images
  useEffect(() => {
    const allSeasons: Season[] = ['barish', 'garmi', 'sardi'];
    allSeasons.forEach((s) => {
      if (s !== season) {
        const img = new Image();
        img.src = SEASONS[s].backgroundImage;
      }
    });
  }, [season]);

  const changeSeason = useCallback((newSeason: Season) => {
    setSeason(newSeason);
  }, []);

  return { season, setSeason: changeSeason, config: SEASONS[season] };
}

export type { Season };
