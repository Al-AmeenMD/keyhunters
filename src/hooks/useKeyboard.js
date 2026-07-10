import { useEffect, useCallback, useRef } from "react";

export function useKeyboard(onKeyPress, enabled = true) {
  const callbackRef = useRef(onKeyPress);
  callbackRef.current = onKeyPress;

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e) => {
      if (e.repeat) return;
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        e.preventDefault();
        callbackRef.current?.(key);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
