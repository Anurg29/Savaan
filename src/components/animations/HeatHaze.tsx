/**
 * Heat haze shimmer effect — creates that wavy distortion you see
 * rising from hot ground on a summer day.
 */
export function HeatHaze() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[8] overflow-hidden" aria-hidden="true">
      {/* Bottom heat shimmer — strongest near the ground */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[30%] animate-heat-shimmer"
        style={{
          background: 'linear-gradient(0deg, rgba(255,200,100,0.04) 0%, transparent 100%)',
          filter: 'url(#heatDistortion)',
        }}
      />

      {/* Mid-level subtle haze */}
      <div
        className="absolute bottom-[20%] left-0 right-0 h-[20%] animate-heat-shimmer-slow"
        style={{
          background: 'linear-gradient(0deg, rgba(255,220,150,0.03) 0%, transparent 100%)',
        }}
      />

      {/* SVG filter for distortion */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="heatDistortion">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.015 0.04"
              numOctaves="2"
              seed="2"
            >
              <animate
                attributeName="baseFrequency"
                values="0.015 0.04;0.02 0.05;0.015 0.04"
                dur="6s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="4" />
          </filter>
        </defs>
      </svg>

      <style>{`
        @keyframes heatShimmer {
          0%, 100% { transform: scaleY(1) translateY(0); opacity: 0.6; }
          50% { transform: scaleY(1.02) translateY(-3px); opacity: 0.8; }
        }
        @keyframes heatShimmerSlow {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-5px); opacity: 0.6; }
        }
        .animate-heat-shimmer {
          animation: heatShimmer 4s ease-in-out infinite;
        }
        .animate-heat-shimmer-slow {
          animation: heatShimmerSlow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
