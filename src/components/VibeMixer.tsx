import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, CloudRain, Zap, Flame, Coffee, Keyboard, X } from 'lucide-react';
import type { AmbientTrack } from '../hooks/useAmbientAudio';

interface VibeMixerProps {
  volumes: Record<AmbientTrack, number>;
  playing: Record<AmbientTrack, boolean>;
  toggleTrack: (track: AmbientTrack) => void;
  setTrackVolume: (track: AmbientTrack, volume: number) => void;
}

const TRACK_INFO: Record<AmbientTrack, { label: string; icon: React.ReactNode }> = {
  rain: { label: 'Rain', icon: <CloudRain size={16} /> },
  thunder: { label: 'Thunder', icon: <Zap size={16} /> },
  fire: { label: 'Fireplace', icon: <Flame size={16} /> },
  cafe: { label: 'Cafe', icon: <Coffee size={16} /> },
  keyboard: { label: 'Typing', icon: <Keyboard size={16} /> },
};

export function VibeMixer({ volumes, playing, toggleTrack, setTrackVolume }: VibeMixerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-6 left-32 ml-4 z-50">
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-full backdrop-blur-xl border border-white/10 shadow-lg transition-colors ${
          isOpen ? 'bg-white/20 text-white' : 'bg-black/30 text-white/70 hover:bg-black/40 hover:text-white'
        }`}
        aria-label="Vibe Mixer"
      >
        <SlidersHorizontal size={16} />
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-3 w-64 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-sm font-semibold tracking-wide">Vibe Mixer</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {(Object.keys(TRACK_INFO) as AmbientTrack[]).map((track) => {
                const isActive = playing[track];
                return (
                  <div key={track} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleTrack(track)}
                        className={`flex items-center gap-2 text-sm transition-colors ${
                          isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        {TRACK_INFO[track].icon}
                        <span>{TRACK_INFO[track].label}</span>
                      </button>
                    </div>
                    
                    <div className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volumes[track]}
                        onChange={(e) => setTrackVolume(track, parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
