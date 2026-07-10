import { useEffect, useCallback, useRef } from "react";

export function useKeyboard(onKeyPress, enabled = true) {
  const callbackRef = useRef(onKeyPress);
  callbackRef.current = onKeyPress;

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e) => {
      if (e.repeat) return;
      const key = e.key;
      // Allow all printable characters of length 1 (letters, numbers, syntax symbols)
      if (key.length === 1) {
        e.preventDefault();
        const isLetter = /^[a-zA-Z]$/.test(key);
        const callbackKey = isLetter ? key.toUpperCase() : key;
        callbackRef.current?.(callbackKey);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
