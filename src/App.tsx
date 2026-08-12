import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSeason } from './hooks/useSeason';
import { useKeyboard } from './hooks/useKeyboard';
import { useWeatherSync } from './hooks/useWeatherSync';
import { useTimeOfDay } from './hooks/useTimeOfDay';
import { useAudio } from './hooks/useAudio';
import { useAmbientAudio } from './hooks/useAmbientAudio';
import { Navigation } from './components/Navigation';
import { PomodoroTimer } from './components/PomodoroTimer';
import { VibeMixer } from './components/VibeMixer';
import { SceneBackground } from './components/UI/SceneBackground';
import { MusicPlayer } from './components/MusicPlayer';
import YouTube from 'react-youtube';
import { Barish } from './scenes/Barish';
import { Garmi } from './scenes/Garmi';
import { Sardi } from './scenes/Sardi';

function App() {
  const { season, setSeason } = useSeason();
  const weatherSync = useWeatherSync(setSeason);
  const timeOfDay = useTimeOfDay();
  const audio = useAudio(season);
  const ambient = useAmbientAudio();

  // Auto-detect weather on initial load
  useEffect(() => {
    // Only auto-sync if we don't have a season set in the URL
    const params = new URLSearchParams(window.location.search);
    if (!params.has('season')) {
      weatherSync.syncWeather();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useKeyboard({
    onSeasonSwitch: (s) => {
      weatherSync.deactivate();
      setSeason(s);
    },
    onPlayPause: audio.togglePlay,
    onNext: audio.next,
    onPrevious: audio.previous,
    onSeekForward: () => audio.seek(audio.currentTime + 10),
    onSeekBackward: () => audio.seek(Math.max(0, audio.currentTime - 10)),
  });

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden">
      {/* Layer 1: Background scene image with crossfade */}
      <AnimatePresence mode="wait">
        <SceneBackground key={season} season={season} timeOfDay={timeOfDay} />
      </AnimatePresence>

      {/* Layer 2: Animated scene overlays */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`overlay-${season}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0 z-10"
        >
          {season === 'barish' && <Barish />}
          {season === 'garmi' && <Garmi />}
          {season === 'sardi' && <Sardi />}
        </motion.div>
      </AnimatePresence>

      {/* Layer 3: Navigation */}
      <Navigation
        currentSeason={season}
        setSeason={setSeason}
        weatherSync={weatherSync}
      />

      {/* Layer 3.5: Productivity Timer & Vibe Mixer */}
      <PomodoroTimer />
      <VibeMixer 
        volumes={ambient.volumes}
        playing={ambient.playing}
        toggleTrack={ambient.toggleTrack}
        setTrackVolume={ambient.setTrackVolume}
      />

      {/* Layer 4: Music Player */}
      <MusicPlayer
        isPlaying={audio.isPlaying}
        duration={audio.duration}
        currentTime={audio.currentTime}
        volume={audio.volume}
        currentTrack={audio.currentTrack}
        loading={audio.loading}
        onPlayPause={audio.togglePlay}
        onNext={audio.next}
        onPrevious={audio.previous}
        onSeek={audio.seek}
        onVolumeChange={audio.setVolume}
        onCustomUrlSubmit={audio.playCustomUrl}
        onLocalFileSubmit={audio.playLocalFile}
      />

      {/* Keyboard hints (bottom-right, desktop only) */}
      <div className="hidden lg:flex fixed bottom-6 right-8 z-30 items-center gap-3 text-white/20 text-xs tracking-wide">
        <span className="px-2 py-1 border border-white/10 rounded">1</span>
        <span className="px-2 py-1 border border-white/10 rounded">2</span>
        <span className="px-2 py-1 border border-white/10 rounded">3</span>
        <span>Switch seasons</span>
        <div className="w-px h-4 bg-white/10 mx-2" />
        <span className="px-2 py-1 border border-white/10 rounded">Space</span>
        <span>Play/Pause</span>
      </div>

      {/* Hidden YouTube Player */}
      <div className="hidden pointer-events-none absolute -z-50 opacity-0">
        <YouTube
          videoId={audio.currentTrack?.audioUrl}
          opts={{
            height: '1',
            width: '1',
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
            },
          }}
          onReady={audio.onPlayerReady}
          onStateChange={audio.onPlayerStateChange}
        />
      </div>
    </div>
  );
}

export default App;
