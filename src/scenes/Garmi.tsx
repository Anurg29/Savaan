import { DustParticles } from '../components/animations/DustParticles';
import { HeatHaze } from '../components/animations/HeatHaze';
import { SunRays } from '../components/animations/SunRays';
import { Curtain } from '../components/animations/Curtain';
import { WindowGlow } from '../components/animations/WindowGlow';

/**
 * Garmi (Summer) Scene — Animated overlay layer.
 * 
 * Layers (bottom to top):
 *   1. Background image (SceneBackground)
 *   2. Heat Haze
 *   3. Sun Rays
 *   4. Dust Particles
 *   5. Curtains
 *   6. Lamp Glow
 */
export function Garmi() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* Heat shimmer mostly near the ground */}
      <HeatHaze />

      {/* Sun rays streaming in */}
      <SunRays />

      {/* Golden dust floating in the air */}
      <DustParticles count={80} />

      {/* Left curtain — positioned near left edge of scene */}
      <Curtain side="left" className="!left-[2%] sm:!left-[5%] !opacity-70" />

      {/* Right curtain — positioned near right side */}
      <Curtain side="right" className="!right-[5%] sm:!right-[8%] !opacity-70" />

      {/* Warm lamp glow — positioned over the lamp on the right */}
      <WindowGlow className="absolute bottom-[20%] right-[10%] sm:right-[15%] w-[150px] h-[150px] sm:w-[250px] sm:h-[250px]" />
    </div>
  );
}
