import { useState, useEffect, useRef } from 'react';

export type AmbientTrack = 'rain' | 'thunder' | 'fire' | 'cafe' | 'keyboard';

const AMBIENT_SOURCES: Record<AmbientTrack, string> = {
  rain: '/audio/rain/ambient.mp3',
  thunder: '/audio/rain/thunder.mp3',
  fire: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Fire_crackling_and_popping_-_1_minute.ogg',
  cafe: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Restaurant_ambience.ogg',
  keyboard: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Typing_on_a_keyboard.ogg',
};

type Volumes = Record<AmbientTrack, number>;
type Playing = Record<AmbientTrack, boolean>;

export function useAmbientAudio() {
  const [volumes, setVolumes] = useState<Volumes>({
    rain: 0.5,
    thunder: 0,
    fire: 0,
    cafe: 0,
    keyboard: 0,
  });

  const [playing, setPlaying] = useState<Playing>({
    rain: false,
    thunder: false,
    fire: false,
    cafe: false,
    keyboard: false,
  });

  const audioRefs = useRef<Record<AmbientTrack, HTMLAudioElement | null>>({
    rain: null,
    thunder: null,
    fire: null,
    cafe: null,
    keyboard: null,
  });

  // Initialize audio elements
  useEffect(() => {
    Object.keys(AMBIENT_SOURCES).forEach((key) => {
      const track = key as AmbientTrack;
      if (!audioRefs.current[track]) {
        const audio = new Audio(AMBIENT_SOURCES[track]);
        audio.loop = true;
        audio.volume = volumes[track];
        audioRefs.current[track] = audio;
      }
    });

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTrack = (track: AmbientTrack) => {
    setPlaying((prev) => {
      const isNowPlaying = !prev[track];
      const audio = audioRefs.current[track];
      if (audio) {
        if (isNowPlaying) {
          audio.play().catch(console.error);
        } else {
          audio.pause();
        }
      }
      return { ...prev, [track]: isNowPlaying };
    });
  };

  const setTrackVolume = (track: AmbientTrack, volume: number) => {
    setVolumes((prev) => ({ ...prev, [track]: volume }));
    const audio = audioRefs.current[track];
    if (audio) {
      audio.volume = volume;
    }
  };

  return {
    volumes,
    playing,
    toggleTrack,
    setTrackVolume,
  };
}
