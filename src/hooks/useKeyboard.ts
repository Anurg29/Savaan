import { useEffect, useCallback } from 'react';

interface KeyboardConfig {
  onSeasonSwitch: (season: 'barish' | 'garmi' | 'sardi') => void;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeekForward?: () => void;
  onSeekBackward?: () => void;
}

export function useKeyboard({
  onSeasonSwitch,
  onPlayPause,
  onNext,
  onPrevious,
  onSeekForward,
  onSeekBackward,
}: KeyboardConfig) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case '1':
          onSeasonSwitch('barish');
          break;
        case '2':
          onSeasonSwitch('garmi');
          break;
        case '3':
          onSeasonSwitch('sardi');
          break;
        case ' ':
          e.preventDefault();
          onPlayPause?.();
          break;
        case 'n':
        case 'N':
          onNext?.();
          break;
        case 'p':
        case 'P':
          onPrevious?.();
          break;
        case 'ArrowRight':
          onSeekForward?.();
          break;
        case 'ArrowLeft':
          onSeekBackward?.();
          break;
      }
    },
    [onSeasonSwitch, onPlayPause, onNext, onPrevious, onSeekForward, onSeekBackward]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
