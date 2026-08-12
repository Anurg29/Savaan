import { motion } from 'framer-motion';
import type { Season } from '../../types';
import { SEASONS } from '../../types';
import type { TimeOfDay } from '../../hooks/useTimeOfDay';

interface SceneBackgroundProps {
  season: Season;
  timeOfDay: TimeOfDay;
}

const TIME_OVERLAYS: Record<TimeOfDay, string> = {
  morning: 'rgba(255, 245, 200, 0.1) mix-blend-overlay', // Soft warm morning glow
  afternoon: 'transparent', // Default lighting
  evening: 'rgba(255, 140, 0, 0.25) mix-blend-color-burn', // Golden hour / sunset
  night: 'rgba(10, 20, 50, 0.6) mix-blend-multiply', // Dark blue moody night
};

/**
 * Renders a full-viewport background image for the given season.
 * Applies atmospheric lighting based on the time of day.
 */
export function SceneBackground({ season, timeOfDay }: SceneBackgroundProps) {
  const config = SEASONS[season];
  
  // Parse the color and blend mode from the config string
  const [overlayColor, blendMode] = TIME_OVERLAYS[timeOfDay].split(' mix-blend-');

  return (
    <motion.div
      key={season}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      {/* Background image layer */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ backgroundImage: `url(${config.backgroundImage})` }}
      />

      {/* Time of Day Atmospheric Overlay */}
      {timeOfDay !== 'afternoon' && (
        <motion.div
          key={`time-${timeOfDay}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
          style={{
            backgroundColor: overlayColor,
            mixBlendMode: blendMode as any,
          }}
        />
      )}

      {/* Subtle vignette overlay for depth */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </motion.div>
  );
}
