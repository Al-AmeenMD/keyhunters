import { ALPHABET_ITEMS } from "./alphabet";
import { WORDS_SHORT, WORDS_MEDIUM, ALL_WORDS } from "./words";

export const STAGES = [
  {
    id: 1,
    name: "Letter Explorer",
    type: "letters",
    label: "Find the Letter",
    description: "Find each letter on the keyboard",
    emoji: "🔤",
    color: "#4ECDC4",
    unlockCondition: null,
  },
  {
    id: 2,
    name: "Tiny Words",
    type: "words",
    label: "Type the Word",
    description: "Type short 3-letter words",
    emoji: "📝",
    color: "#FFC93C",
    pool: WORDS_SHORT,
    unlockCondition: 1,
  },
  {
    id: 3,
    name: "Word Builder",
    type: "words",
    label: "Type the Word",
    description: "Type longer 4-5 letter words",
    emoji: "🏗️",
    color: "#FF6B6B",
    pool: WORDS_MEDIUM,
    unlockCondition: 2,
  },
  {
    id: 4,
    name: "Speed Sprint",
    type: "timed",
    label: "Race the Clock",
    description: "Type as many words as possible in 60s",
    emoji: "⚡",
    color: "#B08CFF",
    pool: ALL_WORDS,
    timeLimit: 60,
    unlockCondition: 3,
  },
  {
    id: 5,
    name: "Challenge Mode",
    type: "challenge",
    label: "Ultimate Challenge",
    description: "Random mix with increasing speed",
    emoji: "🏆",
    color: "#FF9F43",
    pool: ALL_WORDS,
    unlockCondition: 4,
  },
];

export const KEY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export const LEFT_HAND = new Set([
  "Q", "W", "E", "R", "T",
  "A", "S", "D", "F", "G",
  "Z", "X", "C", "V", "B",
]);

export function buildQueue(stage, randomize) {
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  if (stage.type === "letters") {
    const items = ALPHABET_ITEMS.map((it) => ({
      ...it,
      kind: "letter",
      uid: `L-${it.letter}`,
    }));
    return randomize ? shuffle(items) : items;
  }

  const items = (stage.pool || ALL_WORDS).map((it) => ({
    ...it,
    kind: "word",
    uid: `W-${it.word}-${Math.random().toString(36).slice(2, 6)}`,
  }));

  if (stage.type === "timed" || stage.type === "challenge") {
    return shuffle(items);
  }

  return randomize ? shuffle(items) : items;
}

export function isStageUnlocked(stageId, completedStages) {
  const stage = STAGES.find((s) => s.id === stageId);
  if (!stage || !stage.unlockCondition) return true;
  return completedStages.includes(stage.unlockCondition);
}
