/**
 * A subtle animated fog/mist layer that drifts slowly across the scene.
 */
export function Fog() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[8] overflow-hidden" aria-hidden="true">
      {/* Fog layer 1 */}
      <div
        className="absolute w-[200%] h-full opacity-[0.06] animate-fog-drift"
        style={{
          background:
            'repeating-linear-gradient(90deg, transparent 0%, rgba(200,220,240,0.5) 20%, transparent 40%)',
          filter: 'blur(40px)',
        }}
      />
      {/* Fog layer 2 (slower, offset) */}
      <div
        className="absolute w-[200%] h-full opacity-[0.04] animate-fog-drift-slow"
        style={{
          background:
            'repeating-linear-gradient(90deg, transparent 0%, rgba(180,200,220,0.6) 25%, transparent 50%)',
          filter: 'blur(60px)',
          top: '30%',
        }}
      />

      <style>{`
        @keyframes fogDrift {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fogDriftSlow {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-fog-drift {
          animation: fogDrift 30s linear infinite;
        }
        .animate-fog-drift-slow {
          animation: fogDriftSlow 45s linear infinite;
        }
      `}</style>
    </div>
  );
}
