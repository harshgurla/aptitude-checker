import { useState, useEffect } from 'react';

export const useCountdown = (targetTime) => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!targetTime) return;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;
      
      return difference > 0 ? difference : 0;
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const formatTime = () => {
    if (timeRemaining === 0) return 'Available now';

    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return {
    timeRemaining,
    formatTime,
    isExpired: timeRemaining === 0,
  };
};
