import { useState, useEffect } from 'react';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export function useTimeOfDay() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('afternoon');

  useEffect(() => {
    const calculateTimeOfDay = () => {
      const hour = new Date().getHours();
      
      if (hour >= 6 && hour < 12) {
        setTimeOfDay('morning');
      } else if (hour >= 12 && hour < 17) {
        setTimeOfDay('afternoon');
      } else if (hour >= 17 && hour < 20) {
        setTimeOfDay('evening');
      } else {
        setTimeOfDay('night');
      }
    };

    calculateTimeOfDay();
    
    // Check every minute if the time of day bracket has changed
    const interval = setInterval(calculateTimeOfDay, 60000);
    return () => clearInterval(interval);
  }, []);

  return timeOfDay;
}
