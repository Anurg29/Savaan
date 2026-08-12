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

// Default placeholder IDs (Can be playlist ID or video ID)
const YOUTUBE_PLAYLISTS: Record<Season, string> = {
  barish: 'oj9j7KCCX48', // Monsoon Love Mix (User provided)
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

  // Shared fetch logic for both initial load and custom URLs
  const fetchYouTubeData = async (customUrlOrId: string, isCustom = false) => {
    try {
      if (isCustom) {
        setState((prev) => ({ ...prev, loading: true }));
      }
      
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      let videoId = null;
      let playlistId = null;

      // Extract ID from URL or raw ID
      if (customUrlOrId.includes('list=')) {
        playlistId = new URLSearchParams(customUrlOrId.split('?')[1]).get('list');
      } else if (customUrlOrId.includes('v=')) {
        videoId = new URLSearchParams(customUrlOrId.split('?')[1]).get('v');
      } else if (customUrlOrId.includes('youtu.be/')) {
        videoId = customUrlOrId.split('youtu.be/')[1].split('?')[0];
      } else if (customUrlOrId.includes('embed/')) {
        videoId = customUrlOrId.split('embed/')[1].split('?')[0];
      } else {
        // Assume it's a raw video ID if it's 11 chars, else playlist
        if (customUrlOrId.length === 11) videoId = customUrlOrId;
        else playlistId = customUrlOrId;
      }

      let mappedTracks: Track[] = [];

      if (playlistId) {
        const url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch playlist');
        const data = await res.json();
        mappedTracks = data.items.map((item: any) => ({
          title: item.snippet.title,
          artist: item.snippet.videoOwnerChannelTitle || 'YouTube',
          audioUrl: item.snippet.resourceId.videoId,
          coverArt: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        }));
      } else if (videoId) {
        const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch video');
        const data = await res.json();
        if (data.items.length > 0) {
          const item = data.items[0];
          mappedTracks = [{
            title: item.snippet.title,
            artist: item.snippet.channelTitle || 'YouTube',
            audioUrl: videoId,
            coverArt: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
          }];
        }
      }

      if (mappedTracks.length > 0) {
        setState((prev) => ({ 
          ...prev, 
          playlist: mappedTracks,
          currentTrack: mappedTracks[0],
          loading: false,
          isPlaying: isCustom ? true : prev.isPlaying
        }));
        trackIndexRef.current = 0;
        
        if (ytPlayerRef.current) {
          if (isCustom || state.isPlaying) {
            ytPlayerRef.current.loadVideoById(mappedTracks[0].audioUrl);
          } else {
            ytPlayerRef.current.cueVideoById(mappedTracks[0].audioUrl);
          }
        }
      } else {
        throw new Error('No tracks found');
      }
    } catch (err) {
      console.error('Failed to load YouTube data:', err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Fetch initial season playlist
  useEffect(() => {
    let mounted = true;
    setState((prev) => ({ ...prev, loading: true }));

    const id = YOUTUBE_PLAYLISTS[season];
    fetchYouTubeData(id, false);

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

  const playCustomUrl = useCallback(async (customUrl: string) => {
    await fetchYouTubeData(customUrl, true);
  }, []);

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
    playCustomUrl,
    onPlayerReady,
    onPlayerStateChange,
  };
}
