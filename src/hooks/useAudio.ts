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

// Default placeholder IDs (Can be playlist ID or comma-separated video IDs)
const YOUTUBE_PLAYLISTS: Record<Season, string> = {
  barish: 'CBMnRw8D8vo,UiRl-Sa1VZo,U7ZQJIYoGcg', // User provided Marathi songs
  garmi: 'KPewW-iBAcE', // Marathi summer mix
  sardi: 'AgNsTMxQenw', // Marathi winter mix
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
  
  // Reference to the Local HTML5 Audio element
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const trackIndexRef = useRef<number>(0);
  const timeUpdateInterval = useRef<number | null>(null);

  // Initialize the local audio element once
  useEffect(() => {
    localAudioRef.current = new Audio();
    localAudioRef.current.onended = () => handleNext();
    return () => {
      if (localAudioRef.current) {
        localAudioRef.current.pause();
        localAudioRef.current.src = '';
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shared fetch logic for both initial load and custom URLs
  const fetchYouTubeData = async (customUrlOrId: string, isCustom = false) => {
    try {
      if (isCustom) {
        setState((prev) => ({ ...prev, loading: true }));
      }
      
      // API key is now securely held on the backend! No need to check it here.
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
        // Call our secure Netlify backend proxy
        const url = `/api/youtube?playlistId=${playlistId}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          if (res.status === 429) throw new Error('Rate limit exceeded. Please wait an hour.');
          throw new Error('Failed to fetch playlist');
        }
        
        const data = await res.json();
        mappedTracks = data.items.map((item: any) => ({
          title: item.snippet.title,
          artist: item.snippet.videoOwnerChannelTitle || 'YouTube',
          audioUrl: item.snippet.resourceId.videoId,
          coverArt: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        }));
      } else if (videoId) {
        // Call our secure Netlify backend proxy
        const url = `/api/youtube?videoId=${videoId}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          if (res.status === 429) throw new Error('Rate limit exceeded. Please wait an hour.');
          throw new Error('Failed to fetch video');
        }
        
        const data = await res.json();
        if (data.items.length > 0) {
          mappedTracks = data.items.map((item: any) => ({
            title: item.snippet.title,
            artist: item.snippet.channelTitle || 'YouTube',
            audioUrl: item.id, // The video ID is stored in item.id for the 'videos' API
            coverArt: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
          }));
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
          if (localAudioRef.current) localAudioRef.current.pause(); // Stop local audio if switching to YouTube
          
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
    const id = YOUTUBE_PLAYLISTS[season];
    fetchYouTubeData(id, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season]);

  // Handle Player Time Updates
  useEffect(() => {
    if (state.isPlaying) {
      timeUpdateInterval.current = window.setInterval(() => {
        // Sync time from Local Audio
        if (state.currentTrack?.type === 'local' && localAudioRef.current) {
          const currentTime = localAudioRef.current.currentTime;
          const duration = localAudioRef.current.duration || 0;
          setState((prev) => ({ ...prev, currentTime, duration }));
        } 
        // Sync time from YouTube
        else if (ytPlayerRef.current?.getCurrentTime) {
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
  }, [state.isPlaying, state.currentTrack]);

  const playCustomUrl = useCallback(async (customUrl: string) => {
    await fetchYouTubeData(customUrl, true);
  }, []);

  const playLocalFile = useCallback((file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const track: Track = {
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      artist: 'Local File',
      audioUrl: objectUrl,
      type: 'local',
      coverArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop', // Placeholder vinyl cover
    };
    
    // Replace playlist with just this local file
    setState((prev) => ({ 
      ...prev, 
      playlist: [track],
      currentTrack: track,
      loading: false,
      isPlaying: true
    }));
    trackIndexRef.current = 0;

    // Start playing immediately
    if (ytPlayerRef.current) ytPlayerRef.current.pauseVideo();
    if (localAudioRef.current) {
      localAudioRef.current.src = objectUrl;
      localAudioRef.current.volume = state.volume;
      localAudioRef.current.play().catch(console.error);
    }
  }, [state.volume]);

  const onPlayerReady = useCallback((event: { target: any }) => {
    ytPlayerRef.current = event.target;
    ytPlayerRef.current.setVolume(state.volume * 100);
    
    // Cue the first video if available
    if (state.currentTrack && state.currentTrack.type !== 'local') {
      if (state.isPlaying) {
        ytPlayerRef.current.loadVideoById(state.currentTrack.audioUrl);
      } else {
        ytPlayerRef.current.cueVideoById(state.currentTrack.audioUrl);
      }
    }
  }, [state.currentTrack, state.isPlaying, state.volume]);

  const onPlayerStateChange = useCallback((event: { data: number }) => {
    // Only react to YT events if we are not playing a local file
    setState(prev => {
      if (prev.currentTrack?.type === 'local') return prev;
      
      // YT.PlayerState.ENDED = 0, PLAYING = 1, PAUSED = 2
      if (event.data === 0) {
        // We can't call handleNext directly inside setState easily, so we use a microtask
        setTimeout(() => handleNext(), 0);
        return prev;
      }
      return {
        ...prev,
        isPlaying: event.data === 1 ? true : (event.data === 2 ? false : prev.isPlaying)
      };
    });
  }, []);

  const play = useCallback(() => {
    setState((prev) => {
      if (prev.currentTrack?.type === 'local') {
        localAudioRef.current?.play().catch(console.error);
      } else if (ytPlayerRef.current) {
        ytPlayerRef.current.playVideo();
      }
      return { ...prev, isPlaying: true };
    });
  }, []);

  const pause = useCallback(() => {
    setState((prev) => {
      if (prev.currentTrack?.type === 'local') {
        localAudioRef.current?.pause();
      } else if (ytPlayerRef.current) {
        ytPlayerRef.current.pauseVideo();
      }
      return { ...prev, isPlaying: false };
    });
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) pause();
    else play();
  }, [state.isPlaying, play, pause]);

  const loadTrack = useCallback((index: number) => {
    const track = state.playlist[index];
    if (!track) return;
    
    setState((prev) => ({ ...prev, currentTrack: track }));
    
    if (track.type === 'local') {
      if (ytPlayerRef.current) ytPlayerRef.current.pauseVideo();
      if (localAudioRef.current) {
        localAudioRef.current.src = track.audioUrl;
        if (state.isPlaying) localAudioRef.current.play().catch(console.error);
      }
    } else {
      if (localAudioRef.current) localAudioRef.current.pause();
      if (ytPlayerRef.current) {
        if (state.isPlaying) {
          ytPlayerRef.current.loadVideoById(track.audioUrl);
        } else {
          ytPlayerRef.current.cueVideoById(track.audioUrl);
        }
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
    if (localAudioRef.current) {
      localAudioRef.current.volume = val;
    }
    setState((prev) => ({ ...prev, volume: val }));
  }, []);

  const seek = useCallback((time: number) => {
    setState((prev) => {
      if (prev.currentTrack?.type === 'local' && localAudioRef.current) {
        localAudioRef.current.currentTime = time;
      } else if (ytPlayerRef.current) {
        ytPlayerRef.current.seekTo(time, true);
      }
      return { ...prev, currentTime: time };
    });
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
    playLocalFile,
    onPlayerReady,
    onPlayerStateChange,
  };
}
