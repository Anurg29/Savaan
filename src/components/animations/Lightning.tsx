import { useEffect, useState } from 'react';

/**
 * Creates random lightning flashes — sometimes a single flash,
 * sometimes a quick double flash for realism.
 */
export function Lightning() {
  const [flash, setFlash] = useState(false);
  const [thunderAudio] = useState(() => new Audio('/audio/rain/thunder.mp3'));

  useEffect(() => {
    thunderAudio.volume = 0.4; // Subtle thunder volume

    const interval = setInterval(() => {
      if (Math.random() > 0.65) {
        // Visual Flash
        setFlash(true);
        setTimeout(() => setFlash(false), 120);

        // Play Thunder Audio with slight delay to mimic speed of sound
        setTimeout(() => {
          thunderAudio.currentTime = 0;
          thunderAudio.play().catch(() => {}); // catch autoplay restrictions
        }, 300);

        // Occasional double visual flash
        if (Math.random() > 0.5) {
          setTimeout(() => {
            setFlash(true);
            setTimeout(() => setFlash(false), 80);
          }, 200);
        }
      }
    }, 8000); // Trigger every ~8 seconds randomly

    return () => clearInterval(interval);
  }, [thunderAudio]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-[5] transition-opacity duration-75 ${
        flash ? 'opacity-25' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(200,220,255,0.2) 50%, transparent 100%)',
        mixBlendMode: 'overlay',
      }}
      aria-hidden="true"
    />
  );
}
