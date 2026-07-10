import { useRef, useCallback, useEffect } from "react";

const CHORDS = [
  [261.63, 329.63, 392.00, 523.25], // C major arpeggio (C4, E4, G4, C5)
  [349.23, 440.00, 523.25, 698.46], // F major arpeggio (F4, A4, C5, F5)
  [392.00, 493.88, 587.33, 783.99], // G major arpeggio (G4, B4, D5, G5)
  [261.63, 329.63, 392.00, 523.25], // C major arpeggio (C4, E4, G4, C5)
];

export function useAudio(soundOn, musicOn) {
  const audioCtxRef = useRef(null);
  const musicIntervalRef = useRef(null);
  const musicBeatRef = useRef(0);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback(
    (freq, duration = 0.16, type = "sine", volume = 0.15) => {
      if (!soundOn) return;
      try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = volume;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + duration
        );
        osc.stop(ctx.currentTime + duration);
      } catch (e) {
        console.warn("Audio playback failed:", e);
      }
    },
    [soundOn, getCtx]
  );

  const playCorrect = useCallback(() => {
    playTone(880, 0.12, "sine", 0.14);
    setTimeout(() => playTone(1180, 0.14, "sine", 0.12), 90);
  }, [playTone]);

  const playWrong = useCallback(() => {
    playTone(160, 0.2, "sine", 0.1);
  }, [playTone]);

  const playStreak = useCallback(
    (streakCount) => {
      const baseFreq = 600 + Math.min(streakCount, 15) * 40;
      playTone(baseFreq, 0.1, "sine", 0.12);
      setTimeout(() => playTone(baseFreq + 200, 0.12, "sine", 0.1), 70);
    },
    [playTone]
  );

  const playFanfare = useCallback(() => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.25, "sine", 0.12), i * 150);
    });
  }, [playTone]);

  const playAchievement = useCallback(() => {
    const notes = [523, 659, 784, 880, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, "triangle", 0.1), i * 100);
    });
  }, [playTone]);

  const playKeyClick = useCallback(
    (key) => {
      const keyIndex = key.charCodeAt(0) - 65;
      const freq = 400 + keyIndex * 15;
      playTone(freq, 0.06, "sine", 0.06);
    },
    [playTone]
  );

  const speakText = useCallback(
    (text) => {
      if (!soundOn) return;
      try {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.rate = 0.85;
          u.pitch = 1.15;
          window.speechSynthesis.speak(u);
        }
      } catch (e) {
        console.warn("Speech synthesis failed:", e);
      }
    },
    [soundOn]
  );

  // Background music control
  const startMusic = useCallback(() => {
    if (!musicOn) return;
    if (musicIntervalRef.current) return;

    try {
      const ctx = getCtx();
      musicBeatRef.current = 0;

      musicIntervalRef.current = setInterval(() => {
        try {
          if (ctx.state === "suspended") {
            ctx.resume();
          }
          const chordIdx = Math.floor(musicBeatRef.current / 4) % 4;
          const noteIdx = musicBeatRef.current % 4;
          const freq = CHORDS[chordIdx][noteIdx];

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.value = freq;
          
          // Play a very soft, ambient backing note
          gain.gain.setValueAtTime(0.012, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.45);

          musicBeatRef.current = (musicBeatRef.current + 1) % 16;
        } catch (e) {
          // ignore scheduler glitches
        }
      }, 380); // BPM-like speed (approx 150 arpeggio notes/min)
    } catch (e) {
      console.warn("Could not start Web Audio music loop:", e);
    }
  }, [musicOn, getCtx]);

  const stopMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
  }, []);

  // Sync music state changes
  useEffect(() => {
    if (musicOn) {
      startMusic();
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [musicOn, startMusic, stopMusic]);

  return {
    playTone,
    playCorrect,
    playWrong,
    playStreak,
    playFanfare,
    playAchievement,
    playKeyClick,
    speakText,
    startMusic,
    stopMusic,
  };
}
