import React, { useEffect } from "react";
import { useGame } from "../../context/GameContext";

import Button from "../../components/Button/Button";
import { useAudio } from "../../hooks/useAudio";
import { useConfetti } from "../../components/ParticleEffects/Confetti";
import { Star, RotateCcw, ArrowRight, Home } from "lucide-react";
import { formatTime } from "../../utils/helpers";
import "./Results.css";

export default function Results({
  stageIndex,
  resultsData,
  onReplay,
  onNextStage,
  onBackToStages,
  soundOn,
}) {
  const { theme, bestTimes, STAGES } = useGame();
  const stage = STAGES[stageIndex];
  const { time, accuracy, wordsTyped, streak } = resultsData;

  const { playFanfare, playTone } = useAudio(soundOn);
  const { fireBig } = useConfetti();

  const isLastStage = stageIndex === STAGES.length - 1;

  // Star calculation
  let stars = 1;
  if (accuracy >= 95 && time <= 45) stars = 3;
  else if (accuracy >= 85 && time <= 90) stars = 2;

  // Check if this completes the stage record
  const isNewRecord = time === bestTimes[stage.id];

  useEffect(() => {
    playFanfare();
    // Burst confetti on mount
    setTimeout(() => {
      fireBig();
    }, 200);
  }, [playFanfare, fireBig]);

  return (
    <div className="results-container" data-theme={theme}>
      <div className="results-card solid-card anim-pop">
        <div className="results-stars">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`results-star-wrapper ${s <= stars ? "filled anim-star" : ""}`}
              style={{ animationDelay: `${s * 0.15}s` }}
            >
              <Star
                size={44}
                fill={s <= stars ? "var(--accent-gold)" : "none"}
                color={s <= stars ? "var(--accent-gold-dark)" : "var(--text-muted)"}
              />
            </div>
          ))}
        </div>

        <h2 className="results-title font-display">
          {stars === 3
            ? "Superb Job! 🎉"
            : stars === 2
            ? "Awesome! 🌟"
            : "Stage Completed! 👍"}
        </h2>

        {isNewRecord && (
          <div className="results-new-record-banner anim-glow font-display">
            🏆 New Best Record!
          </div>
        )}

        <p className="results-stat-lead">
          You finished {stage.name}!
        </p>

        <div className="results-stats-breakdown">
          <div className="results-stat-box">
            <span className="results-stat-label">Time Taken</span>
            <span className="results-stat-val">{formatTime(time)}</span>
          </div>
          <div className="results-stat-box">
            <span className="results-stat-label">Accuracy</span>
            <span className="results-stat-val">{accuracy}%</span>
          </div>
          <div className="results-stat-box">
            <span className="results-stat-label">Best Streak</span>
            <span className="results-stat-val">{streak}🔥</span>
          </div>
        </div>

        <div className="results-buttons">
          {!isLastStage ? (
            <Button variant="success" size="lg" onClick={onNextStage}>
              Next Stage <ArrowRight size={18} />
            </Button>
          ) : (
            <Button variant="success" size="lg" onClick={onBackToStages}>
              Back to Stages <Home size={18} />
            </Button>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="muted" style={{ flex: 1 }} onClick={onReplay}>
              <RotateCcw size={16} /> Replay
            </Button>
            <Button variant="muted" style={{ flex: 1 }} onClick={onBackToStages}>
              Stages List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
