import { useState, useEffect, useRef, useCallback } from 'react';
import type { Season, Track } from '../types';

interface AudioState {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  currentTrack: Track | null;
  playlist: Track[];
  loading: boolean;
}

// Default placeholder playlists (User can replace these with their own YouTube Playlist IDs)
const YOUTUBE_PLAYLISTS: Record<Season, string> = {
  barish: 'PLn6HMlT2R522pxu1ZPrf4i-bT7mjLX0hY', // Marathi Rain Songs
  garmi: 'PL_jxtHK9hRBYqWsV3TVBowvEsYLBfLztF', // Marathi Lofi
  sardi: 'PLpjbqr-x3QIr3kdDawnKr2lRBsOI10L_q', // Marathi Hits
};

export function useAudio(season: Season) {
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    volume: 0.7, // YouTube player takes 0-100, we map 0-1 to 0-100
    currentTrack: null,
    playlist: [],
    loading: true,
  });

  // Reference to the YouTube Player instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ytPlayerRef = useRef<any>(null);
  const trackIndexRef = useRef<number>(0);
  const timeUpdateInterval = useRef<number | null>(null);

  // Fetch playlist data from YouTube Data API
  useEffect(() => {
    let mounted = true;
    setState((prev) => ({ ...prev, loading: true }));

    const fetchPlaylist = async () => {
      try {
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        const playlistId = YOUTUBE_PLAYLISTS[season];
        
        if (!apiKey) {
          console.error("VITE_YOUTUBE_API_KEY is not defined in .env");
          return;
        }

        const url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error(`YouTube API Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        
        if (!mounted) return;

        // Map YouTube response to our Track format
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedTracks: Track[] = data.items.map((item: any) => ({
          title: item.snippet.title,
          artist: item.snippet.videoOwnerChannelTitle || 'YouTube',
          audioUrl: item.snippet.resourceId.videoId, // We store videoId in audioUrl
          coverArt: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        }));

        setState((prev) => ({ 
          ...prev, 
          playlist: mappedTracks,
          currentTrack: mappedTracks[0] || null,
          loading: false
        }));
        
        trackIndexRef.current = 0;
        
        // If player is already ready, load the new track
        if (ytPlayerRef.current && mappedTracks.length > 0) {
          if (state.isPlaying) {
            ytPlayerRef.current.loadVideoById(mappedTracks[0].audioUrl);
          } else {
            ytPlayerRef.current.cueVideoById(mappedTracks[0].audioUrl);
          }
        }
      } catch (err) {
        console.error('Failed to load YouTube playlist:', err);
        if (mounted) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    fetchPlaylist();

    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season]);

  // Handle Player Time Updates
  useEffect(() => {
    if (state.isPlaying && ytPlayerRef.current) {
      timeUpdateInterval.current = window.setInterval(() => {
        if (ytPlayerRef.current?.getCurrentTime) {
          const currentTime = ytPlayerRef.current.getCurrentTime();
          const duration = ytPlayerRef.current.getDuration();
          setState((prev) => ({ ...prev, currentTime, duration }));
        }
      }, 1000);
    } else if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
    }

    return () => {
      if (timeUpdateInterval.current) clearInterval(timeUpdateInterval.current);
    };
  }, [state.isPlaying]);

  const onPlayerReady = useCallback((event: { target: any }) => {
    ytPlayerRef.current = event.target;
    ytPlayerRef.current.setVolume(state.volume * 100);
    
    // Cue the first video if available
    if (state.currentTrack) {
      if (state.isPlaying) {
        ytPlayerRef.current.loadVideoById(state.currentTrack.audioUrl);
      } else {
        ytPlayerRef.current.cueVideoById(state.currentTrack.audioUrl);
      }
    }
  }, [state.currentTrack, state.isPlaying, state.volume]);

  const onPlayerStateChange = useCallback((event: { data: number }) => {
    // YT.PlayerState.ENDED = 0, PLAYING = 1, PAUSED = 2
    if (event.data === 0) {
      handleNext();
    } else if (event.data === 1) {
      setState((prev) => ({ ...prev, isPlaying: true }));
    } else if (event.data === 2) {
      setState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const play = useCallback(() => {
    if (ytPlayerRef.current) {
      ytPlayerRef.current.playVideo();
      setState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, []);

  const pause = useCallback(() => {
    if (ytPlayerRef.current) {
      ytPlayerRef.current.pauseVideo();
      setState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) pause();
    else play();
  }, [state.isPlaying, play, pause]);

  const loadTrack = useCallback((index: number) => {
    const track = state.playlist[index];
    if (track && ytPlayerRef.current) {
      setState((prev) => ({ ...prev, currentTrack: track }));
      if (state.isPlaying) {
        ytPlayerRef.current.loadVideoById(track.audioUrl);
      } else {
        ytPlayerRef.current.cueVideoById(track.audioUrl);
      }
    }
  }, [state.playlist, state.isPlaying]);

  const handleNext = useCallback(() => {
    trackIndexRef.current = (trackIndexRef.current + 1) % state.playlist.length;
    loadTrack(trackIndexRef.current);
  }, [state.playlist.length, loadTrack]);

  const handlePrevious = useCallback(() => {
    trackIndexRef.current = (trackIndexRef.current - 1 + state.playlist.length) % state.playlist.length;
    loadTrack(trackIndexRef.current);
  }, [state.playlist.length, loadTrack]);

  const setVolume = useCallback((val: number) => {
    if (ytPlayerRef.current) {
      ytPlayerRef.current.setVolume(val * 100);
    }
    setState((prev) => ({ ...prev, volume: val }));
  }, []);

  const seek = useCallback((time: number) => {
    if (ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(time, true);
      setState((prev) => ({ ...prev, currentTime: time }));
    }
  }, []);

  return {
    ...state,
    play,
    pause,
    togglePlay,
    next: handleNext,
    previous: handlePrevious,
    setVolume,
    seek,
    onPlayerReady,
    onPlayerStateChange,
  };
}
