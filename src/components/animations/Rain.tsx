import { useMemo } from 'react';

interface RainProps {
  intensity?: number; // number of rain drops
}

/**
 * Creates a performant rain overlay using CSS animations.
 * Uses hardware-accelerated transforms for 60fps.
 */
export function Rain({ intensity = 120 }: RainProps) {
  const drops = useMemo(() => {
    return Array.from({ length: intensity }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 0.4 + 0.4}s`,
      delay: `${Math.random() * 2}s`,
      opacity: Math.random() * 0.3 + 0.15,
      height: `${Math.random() * 18 + 14}px`,
    }));
  }, [intensity]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10" aria-hidden="true">
      <div className="absolute inset-0 rotate-[12deg] scale-125 transform-gpu">
        {drops.map((drop) => (
          <div
            key={drop.id}
            className="absolute w-[1.5px] rounded-full bg-white/30"
            style={{
              left: drop.left,
              top: '-10%',
              height: drop.height,
              opacity: drop.opacity,
              animation: `rainFall ${drop.duration} linear infinite`,
              animationDelay: drop.delay,
              willChange: 'transform',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes rainFall {
          0% { transform: translateY(0); }
          100% { transform: translateY(110vh); }
        }
      `}</style>
    </div>
  );
}
