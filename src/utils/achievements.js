export const ACHIEVEMENTS = [
  {
    id: "first_steps",
    name: "First Steps",
    description: "Complete the Letter Explorer stage",
    emoji: "🐣",
    check: (stats) => stats.completedStages.includes(1),
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete any stage under 30 seconds",
    emoji: "⚡",
    check: (stats) =>
      Object.values(stats.bestTimes).some((t) => t > 0 && t < 30),
  },
  {
    id: "perfect_score",
    name: "Perfect Score",
    description: "Get 100% accuracy on any stage",
    emoji: "💎",
    check: (stats) => stats.perfectStages.length > 0,
  },
  {
    id: "streak_master",
    name: "Streak Master",
    description: "Get 20 correct in a row",
    emoji: "🔥",
    check: (stats) => stats.bestStreak >= 20,
  },
  {
    id: "all_stars",
    name: "All Stars",
    description: "Complete all 5 stages",
    emoji: "🌟",
    check: (stats) => [1, 2, 3, 4, 5].every((id) => stats.completedStages.includes(id)),
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Play in dark theme",
    emoji: "🦉",
    check: (stats) => stats.usedDarkTheme,
  },
  {
    id: "persistent",
    name: "Persistent",
    description: "Play 10 sessions",
    emoji: "🏋️",
    check: (stats) => stats.sessionsPlayed >= 10,
  },
  {
    id: "word_wizard",
    name: "Word Wizard",
    description: "Type 50 words total",
    emoji: "🧙",
    check: (stats) => stats.totalWordsTyped >= 50,
  },
];

export function checkNewAchievements(stats, unlockedIds) {
  return ACHIEVEMENTS.filter(
    (a) => !unlockedIds.includes(a.id) && a.check(stats)
  );
}
