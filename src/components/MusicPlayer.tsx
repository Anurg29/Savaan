import { Play, Pause, SkipBack, SkipForward, Volume2, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface MusicPlayerProps {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  currentTrack: { title: string; artist: string; coverArt: string } | null;
  loading: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onCustomUrlSubmit: (url: string) => void;
}

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds === 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MusicPlayer({
  isPlaying,
  duration,
  currentTime,
  volume,
  currentTrack,
  loading,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onCustomUrlSubmit,
}: MusicPlayerProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onCustomUrlSubmit(customUrl.trim());
      setCustomUrl('');
      setShowSettings(false);
    }
  };
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.5 }}
      className="fixed bottom-8 left-8 z-40 group"
    >
      {/* 
        The main pill container. 
        It expands horizontally and vertically slightly on hover to reveal extra controls. 
      */}
      <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-full p-2 pr-4 shadow-2xl flex flex-col gap-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black/50 hover:shadow-black/50 hover:px-4">
        
        {/* Top Row: Always Visible (Cover, Info, Play/Pause) */}
        <div className="flex items-center gap-4 h-12">
          
          {/* Cover Art / Cassette Tape visual */}
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-inner">
            {currentTrack?.coverArt ? (
              <img src={currentTrack.coverArt} alt="" className="w-full h-full object-cover opacity-90" />
            ) : (
              <div className="w-6 h-6 rounded-full border-[3px] border-white/20 border-t-white/60 animate-spin" />
            )}
            
            {/* Cassette reel effect */}
            {isPlaying && currentTrack && (
              <motion.div 
                className="absolute inset-0 border-[3px] border-dashed border-black/40 rounded-full scale-75 mix-blend-overlay"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </div>

          {/* Track Details */}
          <div className="flex flex-col justify-center min-w-[120px] max-w-[200px] transition-all duration-500 group-hover:min-w-[180px]">
            <h3 className="text-white/90 font-medium text-sm truncate tracking-wide">
              {loading ? 'Loading...' : currentTrack?.title || 'No Track Selected'}
            </h3>
            <p className="text-white/50 text-[11px] truncate uppercase tracking-wider mt-0.5">
              {currentTrack?.artist || 'Unknown'}
            </p>
          </div>

          {/* Primary Controls (Always Visible) */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/5">
            <button 
              onClick={onPrevious}
              disabled={loading || !currentTrack}
              className="p-1.5 text-white/50 hover:text-white transition-colors disabled:opacity-30 w-0 opacity-0 overflow-hidden group-hover:w-8 group-hover:opacity-100 flex justify-center" 
              aria-label="Previous Track"
            >
              <SkipBack size={18} className="fill-current" />
            </button>

            <button
              onClick={onPlayPause}
              disabled={loading || !currentTrack}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center flex-shrink-0 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-1" />}
            </button>

            <button 
              onClick={onNext}
              disabled={loading || !currentTrack}
              className="p-1.5 text-white/50 hover:text-white transition-colors disabled:opacity-30 w-0 opacity-0 overflow-hidden group-hover:w-8 group-hover:opacity-100 flex justify-center" 
              aria-label="Next Track"
            >
              <SkipForward size={18} className="fill-current" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Revealed on Hover (Seek Bar & Volume) */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
          <div className="overflow-hidden">
            <div className="flex items-center gap-4 pt-3 pb-1 px-1">
              
              {/* Seek Bar */}
              <div className="flex items-center gap-3 flex-1 text-[10px] text-white/40 font-medium tracking-wider">
                <span className="w-8 text-right">{formatTime(currentTime)}</span>
                <div className="relative flex-1 h-1 bg-white/10 rounded-full overflow-hidden group/seek cursor-pointer">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => onSeek(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    aria-label="Seek track"
                  />
                  <div 
                    className="absolute top-0 left-0 h-full bg-white/80 group-hover/seek:bg-white transition-all duration-150"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  />
                </div>
                <span className="w-8">{formatTime(duration)}</span>
              </div>

              <div className="w-px h-3 bg-white/10" />

              {/* Volume Controls */}
              <div className="flex items-center gap-3">
                {/* Settings / Custom Input Toggle */}
              <div className="flex items-center gap-1.5 group/vol relative">
                <button onClick={() => setShowSettings(!showSettings)} className="text-white/40 hover:text-white transition-colors" aria-label="Settings">
                  <Settings size={14} className={showSettings ? 'text-white' : ''} />
                </button>
              </div>
                
                {/* Music Volume */}
                <div className="flex items-center gap-1.5 group/vol relative">
                  <Volume2 size={14} className="text-white/40 hover:text-white transition-colors" />
                  <div className="w-12 flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={(e) => onVolumeChange(Number(e.target.value))}
                      className="w-full h-1 accent-white bg-white/10 hover:bg-white/20 rounded-full appearance-none cursor-pointer transition-colors"
                      aria-label="Volume"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Settings Panel (Custom YouTube Input) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-4 left-0 w-72 bg-black/70 backdrop-blur-3xl border border-white/20 rounded-2xl p-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-white text-sm font-semibold tracking-wide">Custom YouTube Link</h4>
              <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white">
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Paste video or playlist URL..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 transition-colors"
                autoFocus
              />
              <button
                type="submit"
                disabled={!customUrl.trim()}
                className="w-full bg-white text-black text-xs font-semibold py-2 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors"
              >
                Play Custom Link
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
