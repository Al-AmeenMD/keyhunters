import { useCallback } from "react";
import confetti from "canvas-confetti";

export function useConfetti() {
  const fire = useCallback((x, y) => {
    const originX = x / window.innerWidth;
    const originY = y / window.innerHeight;

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: originX, y: originY },
      colors: ["#FFC93C", "#FF6B6B", "#4ECDC4", "#95E06C", "#B08CFF", "#FF9F43"],
      disableForReducedMotion: true,
      gravity: 1.2,
      scalar: 0.9,
      ticks: 120,
    });
  }, []);

  const fireBig = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 150,
      gravity: 0.8,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#FFC93C", "#FF6B6B", "#4ECDC4", "#95E06C", "#B08CFF", "#FF9F43"],
      disableForReducedMotion: true,
    };

    confetti({ ...defaults, particleCount: 50, origin: { x: 0.3, y: 0.5 } });
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 50, origin: { x: 0.7, y: 0.5 } });
    }, 150);
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 70, origin: { x: 0.5, y: 0.4 } });
    }, 300);
  }, []);

  return { fire, fireBig };
}
