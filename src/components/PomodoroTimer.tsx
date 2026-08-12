import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

type TimerMode = 'focus' | 'break';

const MODES = {
  focus: {
    duration: 25 * 60,
    icon: <Brain size={14} />,
    label: 'Focus',
    color: 'bg-white/90 text-black',
  },
  break: {
    duration: 5 * 60,
    icon: <Coffee size={14} />,
    label: 'Break',
    color: 'bg-blue-200/90 text-blue-950',
  },
};

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Play a soft bell sound when timer finishes (optional enhancement)
      const audio = new Audio('/audio/rain/thunder.mp3'); // Fallback if no bell
      audio.volume = 0.2;
      audio.play().catch(() => {});

      // Auto-switch mode
      const nextMode = mode === 'focus' ? 'break' : 'focus';
      setMode(nextMode);
      setTimeLeft(MODES[nextMode].duration);
      setIsActive(false); // require user to start the next session
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].duration);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((MODES[mode].duration - timeLeft) / MODES[mode].duration) * 100;

  return (
    <div className="fixed top-6 left-6 z-50 flex flex-col gap-2">
      {/* Main Timer Pill */}
      <motion.div 
        className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex items-center shadow-lg group transition-all duration-300 hover:bg-black/40"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {/* SVG Progress Ring surrounding the Play button */}
        <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="16"
              cy="16"
              r="15"
              className="fill-none stroke-white/10"
              strokeWidth="2"
            />
            <circle
              cx="16"
              cy="16"
              r="15"
              className="fill-none stroke-white transition-all duration-1000 ease-linear"
              strokeWidth="2"
              strokeDasharray="94.2"
              strokeDashoffset={94.2 - (94.2 * progress) / 100}
            />
          </svg>
          <button
            onClick={toggleTimer}
            className="w-6 h-6 bg-white hover:bg-gray-200 text-black rounded-full flex items-center justify-center relative z-10 transition-transform active:scale-95"
            aria-label={isActive ? "Pause Timer" : "Start Timer"}
          >
            {isActive ? <Pause size={12} className="fill-current" /> : <Play size={12} className="fill-current ml-0.5" />}
          </button>
        </div>

        {/* Time Display */}
        <div className="flex flex-col justify-center px-3 min-w-[70px]">
          <span className="text-white font-semibold text-sm tabular-nums tracking-wider leading-none mb-0.5">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
          <span className="text-white/50 text-[10px] uppercase tracking-widest font-medium leading-none">
            {mode}
          </span>
        </div>

        {/* Hidden Controls (reveal on hover) */}
        <div className="flex items-center gap-1 overflow-hidden w-0 opacity-0 group-hover:w-8 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={resetTimer}
            className="p-1.5 text-white/50 hover:text-white transition-colors"
            title="Reset Timer"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </motion.div>

      {/* Mode Switcher Badges (reveal on hover of the general area) */}
      <div className="flex items-center gap-2 pl-2 opacity-0 group-hover:opacity-100 -translate-y-2 hover:-translate-y-0 hover:opacity-100 transition-all duration-300 absolute top-14 left-0">
        {(['focus', 'break'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wide transition-all ${
              mode === m ? MODES[m].color : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
            }`}
          >
            {MODES[m].icon}
            {MODES[m].label}
          </button>
        ))}
      </div>
    </div>
  );
}
