import { useMemo } from 'react';

interface DustParticlesProps {
  count?: number;
}

/**
 * Floating golden dust particles that drift lazily through sunbeams.
 * Creates that nostalgic summer afternoon feel.
 */
export function DustParticles({ count = 60 }: DustParticlesProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: `${Math.random() * 15 + 10}s`,
      delay: `${Math.random() * 10}s`,
      driftX: Math.random() * 60 - 30,
      driftY: Math.random() * 40 - 20,
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-amber-200/60"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `dustFloat${p.id % 4} ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
            willChange: 'transform',
            filter: 'blur(0.5px)',
          }}
        />
      ))}

      <style>{`
        @keyframes dustFloat0 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(20px, -15px) scale(1.2); opacity: 0.6; }
          50% { transform: translate(35px, 10px) scale(0.8); opacity: 0.4; }
          75% { transform: translate(10px, -5px) scale(1.1); opacity: 0.5; }
        }
        @keyframes dustFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          25% { transform: translate(-15px, -20px) scale(1.3); opacity: 0.5; }
          50% { transform: translate(-25px, 5px) scale(0.9); opacity: 0.3; }
          75% { transform: translate(-5px, -10px) scale(1.1); opacity: 0.6; }
        }
        @keyframes dustFloat2 {
          0%, 100% { transform: translate(0, 0) scale(0.8); opacity: 0.4; }
          33% { transform: translate(15px, 20px) scale(1.2); opacity: 0.6; }
          66% { transform: translate(-10px, -15px) scale(1); opacity: 0.3; }
        }
        @keyframes dustFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1.1); opacity: 0.3; }
          50% { transform: translate(-20px, 15px) scale(0.7); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
