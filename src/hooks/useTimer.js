import { useState, useEffect, useRef, useCallback } from "react";

export function useTimer(isRunning) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const reset = useCallback(() => {
    setSeconds(0);
  }, []);

  return { seconds, reset };
}

export function useCountdown(startFrom, isRunning, onExpire) {
  const [remaining, setRemaining] = useState(startFrom);
  const callbackRef = useRef(onExpire);
  callbackRef.current = onExpire;

  useEffect(() => {
    setRemaining(startFrom);
  }, [startFrom]);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          callbackRef.current?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isRunning, remaining]);

  const reset = useCallback(() => {
    setRemaining(startFrom);
  }, [startFrom]);

  return { remaining, reset };
}
