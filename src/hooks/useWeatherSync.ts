import { useState, useCallback } from 'react';
import type { Season } from '../types';

interface WeatherState {
  loading: boolean;
  active: boolean;
  error: string | null;
  location: string | null;
  weatherDescription: string | null;
}

/**
 * Maps Open-Meteo WMO weather codes to our seasons.
 * https://open-meteo.com/en/docs#weathervariables
 */
function mapWeatherToSeason(code: number, temperature: number): Season {
  // Rain / Drizzle / Thunderstorm codes
  const rainCodes = [
    51, 53, 55, // Drizzle
    56, 57,     // Freezing drizzle
    61, 63, 65, // Rain
    66, 67,     // Freezing rain
    80, 81, 82, // Rain showers
    95, 96, 99, // Thunderstorms
  ];

  // Snow / Ice codes
  const snowCodes = [
    71, 73, 75, // Snowfall
    77,         // Snow grains
    85, 86,     // Snow showers
  ];

  if (rainCodes.includes(code)) return 'barish';
  if (snowCodes.includes(code)) return 'sardi';
  if (temperature < 15) return 'sardi';
  if (temperature > 32) return 'garmi';
  return 'garmi'; // Default warm
}

function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    66: 'Light freezing rain', 67: 'Heavy freezing rain',
    71: 'Slight snowfall', 73: 'Moderate snowfall', 75: 'Heavy snowfall',
    77: 'Snow grains',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
  };
  return descriptions[code] || 'Unknown';
}

export function useWeatherSync(setSeason: (s: Season) => void) {
  const [state, setState] = useState<WeatherState>({
    loading: false,
    active: false,
    error: null,
    location: null,
    weatherDescription: null,
  });

  const syncWeather = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Step 1: Get user's geolocation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false,
        });
      });

      const { latitude, longitude } = position.coords;

      // Step 2: Fetch weather from Open-Meteo (free, no API key)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('Weather API request failed');

      const data = await response.json();
      const weatherCode = data.current.weather_code as number;
      const temperature = data.current.temperature_2m as number;

      // Step 3: Map to season
      const matchedSeason = mapWeatherToSeason(weatherCode, temperature);
      const description = getWeatherDescription(weatherCode);

      setSeason(matchedSeason);

      setState({
        loading: false,
        active: true,
        error: null,
        location: `${latitude.toFixed(1)}°, ${longitude.toFixed(1)}°`,
        weatherDescription: `${description}, ${temperature}°C`,
      });
    } catch (err) {
      const message =
        err instanceof GeolocationPositionError
          ? 'Location access denied'
          : err instanceof Error
            ? err.message
            : 'Something went wrong';

      setState({
        loading: false,
        active: false,
        error: message,
        location: null,
        weatherDescription: null,
      });

      // Auto-dismiss error after 4 seconds
      setTimeout(() => {
        setState((prev) => ({ ...prev, error: null }));
      }, 4000);
    }
  }, [setSeason]);

  const deactivate = useCallback(() => {
    setState((prev) => ({ ...prev, active: false }));
  }, []);

  return { ...state, syncWeather, deactivate };
}
