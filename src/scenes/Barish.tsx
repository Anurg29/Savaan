import { Rain } from '../components/animations/Rain';
import { Lightning } from '../components/animations/Lightning';
import { Curtain } from '../components/animations/Curtain';
import { Steam } from '../components/animations/Steam';
import { Fog } from '../components/animations/Fog';
import { WindowGlow } from '../components/animations/WindowGlow';

/**
 * Barish (Rain) Scene — Animated overlay layer.
 * 
 * Positioned to match the user's illustration:
 * - Left curtain: far left edge of image
 * - Right curtain: center of image (next to the character)
 * - Steam: near the cup on the windowsill (bottom-center-left)
 * - Lamp glow: right side where the pendant lamp hangs
 * - Rain: visible through the window area (left ~45% of image)
 */
export function Barish() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* Lightning flash — illuminates the whole scene */}
      <Lightning />

      {/* Drifting fog — subtle atmospheric depth */}
      <Fog />

      {/* Rain — only over the window area (left portion of the scene) */}
      <div className="absolute top-0 left-0 w-[50%] h-full overflow-hidden">
        <Rain intensity={100} />
      </div>

      {/* Left curtain — at the very left edge of the scene */}
      <Curtain side="left" className="!left-[0%] sm:!left-[2%]" />

      {/* Right curtain — in the center, next to the window/character */}
      <Curtain side="right" className="!right-[42%] sm:!right-[45%] md:!right-[48%]" />

      {/* Steam from the chai cup on the windowsill */}
      <Steam className="absolute bottom-[28%] left-[38%] sm:bottom-[25%] sm:left-[35%]" />

      {/* Warm lamp glow — over the hanging pendant lamp on the right side */}
      <WindowGlow className="absolute top-[15%] right-[22%] sm:right-[28%] w-[150px] h-[150px] sm:w-[250px] sm:h-[250px]" />

      {/* Diya glow — small warm glow on the windowsill */}
      <WindowGlow className="absolute bottom-[26%] left-[32%] sm:left-[30%] w-[60px] h-[60px] sm:w-[80px] sm:h-[80px]" />

      {/* Subtle water reflection shimmer at the bottom */}
      <div
        className="absolute bottom-0 left-0 w-[50%] h-[10%] z-[6]"
        style={{
          background: 'linear-gradient(0deg, rgba(100,150,200,0.06) 0%, transparent 100%)',
          animation: 'shimmer 3s ease-in-out infinite',
        }}
      />

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
