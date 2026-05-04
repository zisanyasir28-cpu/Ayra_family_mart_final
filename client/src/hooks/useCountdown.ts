import { useState, useEffect, useCallback } from 'react';
import { useInterval } from './useInterval';

export interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

/**
 * Counts down to a target ISO date string.
 * Returns { hours, minutes, seconds, isExpired }.
 */
export function useCountdown(targetDate: string | null): CountdownTime {
  const calcRemaining = useCallback((): CountdownTime => {
    if (!targetDate) return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
    const totalSeconds = Math.floor(diff / 1000);
    return {
      hours:   Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      isExpired: false,
    };
  }, [targetDate]);

  const [time, setTime] = useState<CountdownTime>(calcRemaining);

  useEffect(() => {
    setTime(calcRemaining());
  }, [calcRemaining]);

  useInterval(() => {
    const next = calcRemaining();
    setTime(next);
  }, time.isExpired ? null : 1000);

  return time;
}
