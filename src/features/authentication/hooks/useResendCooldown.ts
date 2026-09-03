import { useCallback, useEffect, useRef, useState } from 'react';
import { AUTH_VALUES } from '../auth.constants';

/**
 * Countdown behind the "Resend OTP" link.
 *
 * The deadline is stored as a timestamp rather than a decrementing counter, so
 * backgrounding the app and returning doesn't leave the timer stuck — it
 * recomputes from wall-clock time on every tick.
 */
export function useResendCooldown(initialSeconds = AUTH_VALUES.resendCooldownSeconds) {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const deadlineRef = useRef<number>(Date.now() + initialSeconds * 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(Math.ceil((deadlineRef.current - Date.now()) / 1000), 0);
      setSecondsLeft(remaining);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const restart = useCallback((seconds = initialSeconds) => {
    deadlineRef.current = Date.now() + seconds * 1000;
    setSecondsLeft(seconds);
  }, [initialSeconds]);

  return {
    secondsLeft,
    canResend: secondsLeft <= 0,
    /** "00:24" */
    label: `00:${String(secondsLeft).padStart(2, '0')}`,
    restart,
  };
}
