import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { checkNewAchievements } from "../utils/achievements";
import { STAGES as STATIC_STAGES } from "../data/stages";

const GameContext = createContext(null);

const DEFAULT_PROFILE = {
  name: "Player",
  avatar: "🦊",
  theme: "pastel",
  soundOn: true,
  musicOn: false,
  showFingerGuides: false,
  customWords: [],
};

const DEFAULT_GAME_DATA = {
  profiles: [],
  activeProfileIndex: -1,
  bestTimes: {},
  completedStages: [],
  perfectStages: [],
  achievements: [],
  bestStreak: 0,
  totalWordsTyped: 0,
  sessionsPlayed: 0,
  usedDarkTheme: false,
  leaderboard: [],
  soundOn: true,
  musicOn: false,
  showFingerGuides: false,
  customWords: [],
};

const AVATARS = ["🦊", "🐱", "🐶", "🦁", "🐸", "🐼", "🦄", "🐯", "🐰", "🐨", "🦋", "🐲"];

export { AVATARS };

export function GameProvider({ children }) {
  const [data, setData] = useLocalStorage("key-hunters-pro", DEFAULT_GAME_DATA);

  const activeProfile = useMemo(() => {
    if (data.activeProfileIndex >= 0 && data.profiles[data.activeProfileIndex]) {
      return data.profiles[data.activeProfileIndex];
    }
    return null;
  }, [data.activeProfileIndex, data.profiles]);

  const theme = activeProfile?.theme || "pastel";

  const soundOn = activeProfile?.soundOn !== undefined ? activeProfile.soundOn : (data.soundOn !== undefined ? data.soundOn : true);
  const musicOn = activeProfile?.musicOn !== undefined ? activeProfile.musicOn : (data.musicOn !== undefined ? data.musicOn : false);
  const showFingerGuides = activeProfile?.showFingerGuides !== undefined ? activeProfile.showFingerGuides : (data.showFingerGuides !== undefined ? data.showFingerGuides : false);
  const customWords = activeProfile?.customWords || data.customWords || [];

  const [activeToasts, setActiveToasts] = React.useState([]);

  const addActiveToast = useCallback((toast) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    setActiveToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setActiveToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const setSoundOn = useCallback(
    (val) => {
      setData((prev) => {
        if (prev.activeProfileIndex >= 0 && prev.profiles[prev.activeProfileIndex]) {
          const profiles = [...prev.profiles];
          profiles[prev.activeProfileIndex] = {
            ...profiles[prev.activeProfileIndex],
            soundOn: val,
          };
          return { ...prev, profiles };
        }
        return { ...prev, soundOn: val };
      });
    },
    [setData]
  );

  const setMusicOn = useCallback(
    (val) => {
      setData((prev) => {
        if (prev.activeProfileIndex >= 0 && prev.profiles[prev.activeProfileIndex]) {
          const profiles = [...prev.profiles];
          profiles[prev.activeProfileIndex] = {
            ...profiles[prev.activeProfileIndex],
            musicOn: val,
          };
          return { ...prev, profiles };
        }
        return { ...prev, musicOn: val };
      });
    },
    [setData]
  );

  const setShowFingerGuides = useCallback(
    (val) => {
      setData((prev) => {
        if (prev.activeProfileIndex >= 0 && prev.profiles[prev.activeProfileIndex]) {
          const profiles = [...prev.profiles];
          profiles[prev.activeProfileIndex] = {
            ...profiles[prev.activeProfileIndex],
            showFingerGuides: val,
          };
          return { ...prev, profiles };
        }
        return { ...prev, showFingerGuides: val };
      });
    },
    [setData]
  );

  const setCustomWords = useCallback(
    (words) => {
      setData((prev) => {
        if (prev.activeProfileIndex >= 0 && prev.profiles[prev.activeProfileIndex]) {
          const profiles = [...prev.profiles];
          profiles[prev.activeProfileIndex] = {
            ...profiles[prev.activeProfileIndex],
            customWords: words,
          };
          return { ...prev, profiles };
        }
        return { ...prev, customWords: words };
      });
    },
    [setData]
  );

  const setTheme = useCallback(
    (newTheme) => {
      setData((prev) => {
        const profiles = [...prev.profiles];
        if (profiles[prev.activeProfileIndex]) {
          profiles[prev.activeProfileIndex] = {
            ...profiles[prev.activeProfileIndex],
            theme: newTheme,
          };
        }
        return {
          ...prev,
          profiles,
          usedDarkTheme: newTheme === "dark" ? true : prev.usedDarkTheme,
        };
      });
    },
    [setData]
  );

  const createProfile = useCallback(
    (name, avatar) => {
      setData((prev) => {
        const newProfile = {
          name: name || "Player",
          avatar: avatar || "🦊",
          theme: "pastel",
          soundOn: true,
          musicOn: false,
          showFingerGuides: false,
          customWords: [],
        };
        const profiles = [...prev.profiles, newProfile];
        return { ...prev, profiles, activeProfileIndex: profiles.length - 1 };
      });
    },
    [setData]
  );

  const selectProfile = useCallback(
    (index) => {
      setData((prev) => ({ ...prev, activeProfileIndex: index }));
    },
    [setData]
  );

  const recordStageComplete = useCallback(
    (stageId, time, accuracy, wordsTyped, streak) => {
      setData((prev) => {
        const bestTimes = { ...prev.bestTimes };
        const isBest = bestTimes[stageId] === undefined || time < bestTimes[stageId];
        if (isBest) bestTimes[stageId] = time;

        const completedStages = prev.completedStages.includes(stageId)
          ? prev.completedStages
          : [...prev.completedStages, stageId];

        const perfectStages =
          accuracy === 100 && !prev.perfectStages.includes(stageId)
            ? [...prev.perfectStages, stageId]
            : prev.perfectStages;

        const bestStreak = Math.max(prev.bestStreak, streak);
        const totalWordsTyped = prev.totalWordsTyped + wordsTyped;
        const sessionsPlayed = prev.sessionsPlayed + 1;

        const newStats = {
          bestTimes,
          completedStages,
          perfectStages,
          bestStreak,
          totalWordsTyped,
          sessionsPlayed,
          usedDarkTheme: prev.usedDarkTheme,
        };

        const newAchievements = checkNewAchievements(newStats, prev.achievements);
        const achievements = [
          ...prev.achievements,
          ...newAchievements.map((a) => a.id),
        ];

        // Trigger mid-game achievement toasts if we just unlocked them
        newAchievements.forEach((ach) => {
          addActiveToast({
            title: "Badge Unlocked!",
            description: `${ach.emoji} ${ach.name}`,
            type: "achievement",
          });
        });

        const leaderboardEntry = {
          id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
          name: prev.profiles[prev.activeProfileIndex]?.name || "Player",
          stageId,
          time,
          accuracy,
          date: new Date().toISOString(),
        };

        const leaderboard = [...prev.leaderboard, leaderboardEntry].slice(-100);

        return {
          ...prev,
          bestTimes,
          completedStages,
          perfectStages,
          bestStreak,
          totalWordsTyped,
          sessionsPlayed,
          achievements,
          leaderboard,
        };
      });
    },
    [setData, addActiveToast]
  );

  const stages = useMemo(() => {
    const list = [...STATIC_STAGES];
    if (customWords && customWords.length > 0) {
      list.push({
        id: 7,
        name: "My Spelling List",
        type: "words",
        label: "Type Spelling Words",
        description: "Practice your custom spelling list",
        emoji: "📝",
        color: "#E289F2",
        pool: customWords.map((w) => ({ word: w, emoji: "✏️" })),
        unlockCondition: null,
      });
    }
    return list;
  }, [customWords]);

  const value = useMemo(
    () => ({
      ...data,
      activeProfile,
      theme,
      soundOn,
      musicOn,
      showFingerGuides,
      customWords,
      activeToasts,
      STAGES: stages,
      setTheme,
      createProfile,
      selectProfile,
      recordStageComplete,
      setSoundOn,
      setMusicOn,
      setShowFingerGuides,
      setCustomWords,
      addActiveToast,
    }),
    [
      data,
      activeProfile,
      theme,
      soundOn,
      musicOn,
      showFingerGuides,
      customWords,
      activeToasts,
      stages,
      setTheme,
      createProfile,
      selectProfile,
      recordStageComplete,
      setSoundOn,
      setMusicOn,
      setShowFingerGuides,
      setCustomWords,
      addActiveToast,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
