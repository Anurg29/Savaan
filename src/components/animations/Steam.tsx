import { motion } from 'framer-motion';

/**
 * Animated steam wisps rising from a cup/chai.
 * Position this absolutely over where the cup is in the scene image.
 */
export function Steam({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 rounded-full bg-white/20 blur-[3px]"
          style={{
            width: `${4 + i * 2}px`,
            height: `${4 + i * 2}px`,
            left: `${i * 8 - 4}px`,
          }}
          animate={{
            y: [0, -40 - i * 15],
            x: [0, (i - 1) * 8, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.5, 2],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
