import { useMemo } from 'react';

interface SnowProps {
  intensity?: number;
}

/**
 * Creates falling snow overlay.
 */
export function Snow({ intensity = 100 }: SnowProps) {
  const flakes = useMemo(() => {
    return Array.from({ length: intensity }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 4 + 4}s`,
      delay: `${Math.random() * -5}s`,
      opacity: Math.random() * 0.5 + 0.3,
      size: `${Math.random() * 4 + 2}px`,
      drift: Math.random() > 0.5 ? 1 : -1,
    }));
  }, [intensity]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10" aria-hidden="true">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white blur-[1px]"
          style={{
            left: flake.left,
            top: '-10%',
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            animation: `snowFall${flake.drift > 0 ? 'Right' : 'Left'} ${flake.duration} linear infinite`,
            animationDelay: flake.delay,
            willChange: 'transform',
          }}
        />
      ))}

      <style>{`
        @keyframes snowFallRight {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(40px, 110vh) rotate(360deg); }
        }
        @keyframes snowFallLeft {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(-40px, 110vh) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}
