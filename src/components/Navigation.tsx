import { CloudRain, Sun, Snowflake, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { type Season, SEASONS } from '../types';

interface NavigationProps {
  currentSeason: Season;
  setSeason: (season: Season) => void;
  weatherSync: {
    loading: boolean;
    active: boolean;
    error: string | null;
    weatherDescription: string | null;
    syncWeather: () => void;
    deactivate: () => void;
  };
}

const ICONS: Record<Season, React.ReactNode> = {
  barish: <CloudRain size={16} />,
  garmi: <Sun size={16} />,
  sardi: <Snowflake size={16} />,
};

export function Navigation({ currentSeason, setSeason, weatherSync }: NavigationProps) {
  const handleManualSelect = (id: Season) => {
    weatherSync.deactivate();
    setSeason(id);
  };

  const seasons: Season[] = ['barish', 'garmi', 'sardi'];

  return (
    <nav
      className="fixed top-6 right-6 z-50 flex flex-col items-end gap-3"
      role="navigation"
      aria-label="Season navigation"
    >
      <div className="relative flex items-center gap-1 p-1.5 bg-black/25 backdrop-blur-xl rounded-full border border-white/[0.08] shadow-2xl">
        {/* Season Tabs */}
        {seasons.map((id) => {
          const config = SEASONS[id];
          const isActive = currentSeason === id && !weatherSync.active;

          return (
            <button
              key={id}
              onClick={() => handleManualSelect(id)}
              className="relative flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label={`Switch to ${config.label} season`}
              aria-pressed={isActive}
            >
              {/* Active indicator pill */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/[0.12] rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'}`}>
                {ICONS[id]}
              </span>
              <span className={`relative z-10 text-sm font-medium tracking-wide transition-colors duration-300 hidden sm:inline ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'}`}>
                {config.label}
              </span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 mx-1" aria-hidden="true" />

        {/* Auto Weather Button */}
        <button
          onClick={() => weatherSync.syncWeather()}
          disabled={weatherSync.loading}
          className={`relative flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40
            ${weatherSync.active
              ? 'text-white'
              : 'text-white/50 hover:text-white/80'}
            ${weatherSync.loading ? 'cursor-wait' : ''}
          `}
          aria-label="Auto-detect weather from your location"
          title={weatherSync.weatherDescription ?? 'Sync to your local weather'}
        >
          {weatherSync.active && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white/[0.12] rounded-full"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">
            {weatherSync.loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <MapPin size={16} />
            )}
          </span>
          <span className="relative z-10 text-sm font-medium tracking-wide hidden sm:inline">
            Auto
          </span>
        </button>
      </div>

      {/* Weather info badge */}
      {weatherSync.active && weatherSync.weatherDescription && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="px-4 py-1.5 bg-black/30 backdrop-blur-xl rounded-full border border-white/[0.06] text-white/60 text-xs tracking-wide"
        >
          📍 {weatherSync.weatherDescription}
        </motion.div>
      )}

      {/* Error badge */}
      {weatherSync.error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-1.5 bg-red-900/30 backdrop-blur-xl rounded-full border border-red-400/10 text-red-300/80 text-xs tracking-wide"
        >
          {weatherSync.error}
        </motion.div>
      )}
    </nav>
  );
}
