import React, { useState, useEffect } from 'react';

export const Timer = ({ endTime, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const remaining = endTime - now;

      if (remaining <= 0) {
        setTimeLeft(0);
        onTimeUp();
      } else {
        setTimeLeft(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  const isLowTime = timeLeft < 5 * 60 * 1000; // Less than 5 minutes

  return (
    <div className={`flex items-center gap-2 font-bold text-lg ${isLowTime ? 'text-red-600' : 'text-gray-700'}`}>
      ⏱️ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};
