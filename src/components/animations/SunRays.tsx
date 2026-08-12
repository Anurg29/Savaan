/**
 * God rays / Sun beams streaming through the window.
 * Rotates slowly and pulses in opacity.
 */
export function SunRays() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[15] overflow-hidden" aria-hidden="true">
      <div 
        className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] opacity-40 mix-blend-screen"
        style={{
          background: 'conic-gradient(from 180deg at 50% -20%, transparent 40deg, rgba(255,240,200,0.4) 45deg, rgba(255,230,180,0.6) 50deg, rgba(255,240,200,0.4) 55deg, transparent 60deg)',
          transformOrigin: 'top center',
          animation: 'sunRaySweep 15s ease-in-out infinite',
        }}
      />
      <div 
        className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] opacity-20 mix-blend-screen"
        style={{
          background: 'conic-gradient(from 180deg at 50% -20%, transparent 20deg, rgba(255,220,150,0.3) 25deg, rgba(255,210,140,0.5) 30deg, rgba(255,220,150,0.3) 35deg, transparent 40deg)',
          transformOrigin: 'top center',
          animation: 'sunRaySweep 20s ease-in-out infinite reverse',
        }}
      />
      
      <style>{`
        @keyframes sunRaySweep {
          0%, 100% { transform: rotate(-5deg); opacity: 0.3; }
          50% { transform: rotate(5deg); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
