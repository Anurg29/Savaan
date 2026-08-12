/**
 * Subtle warm glow that pulses gently — mimics lamp or diya light.
 * Position this over any light source in the scene image.
 */
export function WindowGlow({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <div
        className="w-full h-full rounded-full animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, rgba(255,180,60,0.25) 0%, rgba(255,150,30,0.1) 40%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-pulse-glow {
          animation: pulseGlow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
