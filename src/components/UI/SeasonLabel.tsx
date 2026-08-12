import { motion } from 'framer-motion';
import type { Season } from '../../types';
import { SEASONS } from '../../types';

interface SeasonLabelProps {
  season: Season;
}

/**
 * Displays the current season name as a large, elegant typographic element.
 * Shown as a subtle overlay on the scene.
 */
export function SeasonLabel({ season }: SeasonLabelProps) {
  const config = SEASONS[season];

  return (
    <motion.div
      key={season}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      className="absolute bottom-12 left-8 sm:left-12 z-20 pointer-events-none select-none"
    >
      <p className="text-white/30 text-xs sm:text-sm tracking-[0.3em] uppercase mb-2 font-light">
        {config.emoji} Now Experiencing
      </p>
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight text-white/70 tracking-wider capitalize">
        {config.label}
      </h1>
    </motion.div>
  );
}
