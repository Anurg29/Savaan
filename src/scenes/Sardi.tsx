import { Snow } from '../components/animations/Snow';
import { Curtain } from '../components/animations/Curtain';
import { Steam } from '../components/animations/Steam';
import { Fire } from '../components/animations/Fire';
import { WindowGlow } from '../components/animations/WindowGlow';
import { Fog } from '../components/animations/Fog';

/**
 * Sardi (Winter) Scene — Animated overlay layer.
 * 
 * Layers (bottom to top):
 *   1. Background image (SceneBackground)
 *   2. Falling Snow (visible through the window)
 *   3. Fog/Mist (cold ambient air)
 *   4. Curtains
 *   5. Fire (Angeethi on the left)
 *   6. Steam (Chai on the right)
 *   7. Lamp/Diya Glows
 */
export function Sardi() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* Cold mist/fog drifting */}
      <Fog />

      {/* Snow falling outside the window */}
      <div className="absolute top-[10%] left-[25%] w-[50%] h-[70%] overflow-hidden mask-window">
        <Snow intensity={150} />
      </div>

      {/* Left curtain */}
      <Curtain side="left" className="!left-[10%] sm:!left-[15%] !opacity-80" />

      {/* Right curtain */}
      <Curtain side="right" className="!right-[10%] sm:!right-[15%] !opacity-80" />

      {/* Angeethi fire on the bottom left */}
      <Fire className="absolute bottom-[25%] left-[8%] sm:left-[10%] w-[60px] h-[60px]" />

      {/* Steam from the chai cup on the right table */}
      <Steam className="absolute bottom-[20%] right-[12%] sm:right-[15%] opacity-70" />

      {/* Warm lamp glow on the right */}
      <WindowGlow className="absolute bottom-[30%] right-[5%] sm:right-[8%] w-[200px] h-[200px] sm:w-[300px] sm:h-[300px]" />

      {/* Diya glow in the center window sill */}
      <WindowGlow className="absolute bottom-[28%] left-[48%] sm:left-[50%] w-[80px] h-[80px] sm:w-[100px] sm:h-[100px]" />

      <style>{`
        .mask-window {
          /* Soft mask to blend snow into the window frame */
          mask-image: radial-gradient(ellipse at center, black 60%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 60%, transparent 100%);
        }
      `}</style>
    </div>
  );
}
