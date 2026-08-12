/**
 * Animated curtain overlays that sit on top of the background image.
 * 
 * These are semi-transparent white elements that sway gently,
 * positioned to match the curtain locations in the scene image.
 * The original static curtains in the image show through beneath.
 */
export function Curtain({ side, className = '' }: { side: 'left' | 'right'; className?: string }) {
  const isLeft = side === 'left';

  return (
    <div
      className={`absolute top-0 h-full pointer-events-none z-20 ${
        isLeft ? 'left-[2%] sm:left-[5%]' : 'right-[2%] sm:right-[5%]'
      } ${className}`}
      style={{ width: 'clamp(80px, 15vw, 180px)' }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 120 800"
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{
          filter: 'blur(1px)',
          opacity: 0.5,
        }}
      >
        <defs>
          <linearGradient
            id={`curtainGrad-${side}`}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            {isLeft ? (
              <>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="40%" stopColor="#f0f0f0" stopOpacity="0.25" />
                <stop offset="70%" stopColor="#ffffff" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="30%" stopColor="#ffffff" stopOpacity="0.15" />
                <stop offset="60%" stopColor="#f0f0f0" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
              </>
            )}
          </linearGradient>
        </defs>

        {/* Main curtain body — animates with CSS */}
        <path
          fill={`url(#curtainGrad-${side})`}
          className={isLeft ? 'animate-curtain-left' : 'animate-curtain-right'}
        >
          {/* The path is set via the animation */}
        </path>

        {/* Fabric fold lines for realism */}
        <line
          x1={isLeft ? '40' : '80'}
          y1="0"
          x2={isLeft ? '35' : '85'}
          y2="800"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="8"
          className={isLeft ? 'animate-curtain-left' : 'animate-curtain-right'}
        />
        <line
          x1={isLeft ? '70' : '50'}
          y1="0"
          x2={isLeft ? '60' : '60'}
          y2="800"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="5"
          className={isLeft ? 'animate-curtain-left' : 'animate-curtain-right'}
        />
      </svg>

      {/* CSS-based curtain body (more reliable cross-browser) */}
      <div
        className={`absolute inset-0 ${isLeft ? 'animate-sway-left' : 'animate-sway-right'}`}
        style={{
          background: isLeft
            ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.08) 80%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.12) 70%, transparent 100%)',
          transformOrigin: 'top center',
          borderRadius: '0 0 40% 40%',
        }}
      />

      <style>{`
        @keyframes swayLeft {
          0%, 100% {
            transform: skewX(-2deg) translateX(0px);
          }
          25% {
            transform: skewX(3deg) translateX(8px);
          }
          50% {
            transform: skewX(-1deg) translateX(15px);
          }
          75% {
            transform: skewX(2deg) translateX(5px);
          }
        }
        @keyframes swayRight {
          0%, 100% {
            transform: skewX(2deg) translateX(0px);
          }
          25% {
            transform: skewX(-3deg) translateX(-8px);
          }
          50% {
            transform: skewX(1deg) translateX(-15px);
          }
          75% {
            transform: skewX(-2deg) translateX(-5px);
          }
        }
        .animate-sway-left {
          animation: swayLeft 7s ease-in-out infinite;
        }
        .animate-sway-right {
          animation: swayRight 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
