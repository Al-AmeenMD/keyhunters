import React, { useState, useEffect, useRef, useCallback, useReducer } from "react";
import { useGame } from "../../context/GameContext";
import { buildQueue } from "../../data/stages";
import { useAudio } from "../../hooks/useAudio";
import { useTimer, useCountdown } from "../../hooks/useTimer";
import { useKeyboard } from "../../hooks/useKeyboard";
import { useConfetti } from "../../components/ParticleEffects/Confetti";
import StatsBar from "../../components/StatsBar/StatsBar";
import TargetCard from "../../components/TargetCard/TargetCard";
import Keyboard from "../../components/Keyboard/Keyboard";
import FloatingPoints from "../../components/ParticleEffects/FloatingPoints";
import Button from "../../components/Button/Button";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";
import "./Game.css";

const initialGameState = {
  posIndex: 0,
  typedIndex: 0,
  wrongFlash: false,
  streak: 0,
  correctCount: 0,
  totalAttempts: 0,
  plusFloats: [],
  pressedKey: null,
};

function gameReducer(state, action) {
  switch (action.type) {
    case "CORRECT_KEY":
      return {
        ...state,
        streak: state.streak + 1,
        correctCount: state.correctCount + 1,
        totalAttempts: state.totalAttempts + 1,
      };
    case "WRONG_KEY":
      return {
        ...state,
        streak: 0,
        totalAttempts: state.totalAttempts + 1,
        wrongFlash: true,
      };
    case "CLEAR_FLASH":
      return {
        ...state,
        wrongFlash: false,
      };
    case "ADVANCE_LETTER":
      return {
        ...state,
        posIndex: state.posIndex + 1,
        typedIndex: 0,
      };
    case "ADVANCE_WORD_CHAR":
      return {
        ...state,
        typedIndex: state.typedIndex + 1,
      };
    case "PRESS_KEY":
      return {
        ...state,
        pressedKey: action.payload,
      };
    case "CLEAR_PRESSED_KEY":
      return {
        ...state,
        pressedKey: null,
      };
    case "ADD_FLOAT_POINT":
      return {
        ...state,
        plusFloats: [...state.plusFloats, action.payload],
      };
    case "REMOVE_FLOAT_POINT":
      return {
        ...state,
        plusFloats: state.plusFloats.filter((f) => f.id !== action.payload),
      };
    case "RESET_GAME_STATE":
      return initialGameState;
    default:
      return state;
  }
}

export default function Game({ stageIndex, onBackToStages, onStageFinished }) {
  const { bestTimes, theme, recordStageComplete, soundOn, musicOn, showFingerGuides, STAGES } = useGame();
  const stage = STAGES[stageIndex];
  const isTimed = stage.type === "timed";

  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [isPaused, setIsPaused] = useState(false);
  const [queue, setQueue] = useState(() => buildQueue(stage, false));
  const cardRef = useRef(null);

  const {
    playCorrect,
    playWrong,
    playStreak,
    playKeyClick,
    speakText,
  } = useAudio(soundOn, musicOn);

  const { fire } = useConfetti();

  const isComplete = queue.length > 0 && gameState.posIndex >= queue.length;
  const currentItem = !isComplete ? queue[gameState.posIndex] : null;

  const targetKey = currentItem
    ? currentItem.kind === "letter"
      ? currentItem.letter
      : currentItem.word[gameState.typedIndex]
    : null;

  // Handle countdown if timed, otherwise count-up timer
  const { seconds, reset: resetTimer } = useTimer(!isPaused && !isComplete && !isTimed);
  
  const handleTimeExpire = useCallback(() => {
    // When time expires in timed mode, wrap up the game and record
    const finalAccuracy =
      gameState.totalAttempts > 0
        ? Math.round((gameState.correctCount / gameState.totalAttempts) * 100)
        : 100;
    
    // We complete with what we have
    recordStageComplete(
      stage.id,
      60 - remaining,
      finalAccuracy,
      gameState.posIndex,
      gameState.streak
    );
    onStageFinished({
      time: 60 - remaining,
      accuracy: finalAccuracy,
      wordsTyped: gameState.posIndex,
      streak: gameState.streak,
    });
  }, [gameState, recordStageComplete, stage.id, onStageFinished]);

  const { remaining, reset: resetCountdown } = useCountdown(
    stage.timeLimit || 60,
    !isPaused && !isComplete && isTimed,
    handleTimeExpire
  );

  // Complete game (Normal Stage complete condition)
  useEffect(() => {
    if (isComplete && !isTimed) {
      const finalAccuracy =
        gameState.totalAttempts > 0
          ? Math.round((gameState.correctCount / gameState.totalAttempts) * 100)
          : 100;

      recordStageComplete(
        stage.id,
        seconds,
        finalAccuracy,
        queue.length,
        gameState.streak
      );
      onStageFinished({
        time: seconds,
        accuracy: finalAccuracy,
        wordsTyped: queue.length,
        streak: gameState.streak,
      });
    }
  }, [isComplete, isTimed, gameState, seconds, recordStageComplete, stage.id, onStageFinished, queue.length]);

  const handleInputKey = useCallback(
    (key) => {
      if (isPaused || isComplete || !currentItem) return;

      dispatch({ type: "PRESS_KEY", payload: key });
      setTimeout(() => dispatch({ type: "CLEAR_PRESSED_KEY" }), 150);

      if (key === targetKey) {
        dispatch({ type: "CORRECT_KEY" });
        playCorrect();
        playKeyClick(key);

        if (cardRef.current) {
          const rect = cardRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 3;

          fire(centerX, centerY);

          const floatId = `${Date.now()}-${Math.random()}`;
          dispatch({
            type: "ADD_FLOAT_POINT",
            payload: { id: floatId, x: centerX, y: rect.top },
          });
          setTimeout(() => {
            dispatch({ type: "REMOVE_FLOAT_POINT", payload: floatId });
          }, 800);
        }

        if (currentItem.kind === "letter") {
          speakText(`${currentItem.letter}. ${currentItem.word}`);
          dispatch({ type: "ADVANCE_LETTER" });
        } else {
          const nextIndex = gameState.typedIndex + 1;
          if (nextIndex >= currentItem.word.length) {
            speakText(currentItem.word);
            dispatch({ type: "ADVANCE_LETTER" });
          } else {
            speakText(key);
            dispatch({ type: "ADVANCE_WORD_CHAR" });
          }
        }
      } else {
        dispatch({ type: "WRONG_KEY" });
        playWrong();
        setTimeout(() => dispatch({ type: "CLEAR_FLASH" }), 400);
      }
    },
    [isPaused, isComplete, currentItem, targetKey, gameState.typedIndex, playCorrect, playKeyClick, playWrong, speakText, fire]
  );

  // Hook up physical keyboard
  useKeyboard(handleInputKey, !isPaused && !isComplete);

  const togglePause = () => {
    setIsPaused((p) => !p);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleRestart = () => {
    dispatch({ type: "RESET_GAME_STATE" });
    setQueue(buildQueue(stage, true));
    setIsPaused(false);
    resetTimer();
    resetCountdown();
  };

  return (
    <div className="game-container" data-theme={theme}>
      <div className="game-header anim-slide-down">
        <Button variant="muted" size="sm" onClick={togglePause}>
          <Pause size={16} /> Pause
        </Button>

        <div className="game-title-section">
          <h1 className="game-title">{stage.name}</h1>
          <span className="game-subtitle">{stage.label}</span>
        </div>

        <button
          onClick={() => setSoundOn((s) => !s)}
          className="theme-toggle-btn"
          title={soundOn ? "Mute sound" : "Unmute sound"}
        >
          {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      <StatsBar
        seconds={seconds}
        remaining={remaining}
        bestTime={bestTimes[stage.id]}
        posIndex={gameState.posIndex}
        total={queue.length}
        streak={gameState.streak}
        isTimed={isTimed}
      />

      <div className="game-card-wrapper">
        <TargetCard
          item={currentItem}
          typedIndex={gameState.typedIndex}
          wrongFlash={gameState.wrongFlash}
          cardRef={cardRef}
        />
      </div>

      <div className="game-keyboard-wrapper">
        <Keyboard
          targetKey={targetKey}
          pressedKey={gameState.pressedKey}
          onKeyClick={handleInputKey}
          showFingerGuides={showFingerGuides}
        />
      </div>

      <FloatingPoints points={gameState.plusFloats} />

      {/* Pause Screen */}
      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-card solid-card anim-pop">
            <h2 className="pause-title">Game Paused</h2>
            <div className="pause-buttons">
              <Button variant="success" size="lg" onClick={handleResume}>
                <Play size={18} /> Continue Game
              </Button>
              <Button variant="gold" onClick={handleRestart}>
                Restart Stage
              </Button>
              <Button variant="muted" onClick={onBackToStages}>
                Exit to Stages
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
