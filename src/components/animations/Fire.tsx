import { motion } from 'framer-motion';

/**
 * Animated flickering fire glow and embers.
 */
export function Fire({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      {/* Base glow */}
      <motion.div
        className="absolute inset-0 rounded-full mix-blend-screen blur-[10px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,100,0,0.8) 0%, rgba(255,50,0,0.4) 40%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.1, 0.9, 1.05, 1],
          opacity: [0.8, 1, 0.7, 0.9, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Embers */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute bottom-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-yellow-400 blur-[1px]"
          animate={{
            y: [0, -40 - Math.random() * 60],
            x: [0, (Math.random() - 0.5) * 40],
            opacity: [1, 0],
            scale: [1, 0],
          }}
          transition={{
            duration: 1 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
