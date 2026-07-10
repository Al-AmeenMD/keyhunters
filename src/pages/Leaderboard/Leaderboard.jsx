import React, { useState } from "react";
import { useGame } from "../../context/GameContext";

import Button from "../../components/Button/Button";
import { formatTime } from "../../utils/helpers";
import { ChevronLeft, Trophy, Calendar } from "lucide-react";
import "./Leaderboard.css";

export default function Leaderboard({ onBack }) {
  const { leaderboard, theme, STAGES } = useGame();
  const [activeStageId, setActiveStageId] = useState(1);

  // Filter and sort entries for the active stage
  const entries = leaderboard
    .filter((e) => e.stageId === activeStageId)
    .sort((a, b) => {
      // Sort by time ascending
      if (a.time !== b.time) return a.time - b.time;
      // Sort by accuracy descending
      return b.accuracy - a.accuracy;
    })
    .slice(0, 10); // Top 10

  const activeStage = STAGES.find((s) => s.id === activeStageId);

  return (
    <div className="leaderboard-container" data-theme={theme}>
      <div className="leaderboard-header anim-slide-down">
        <Button variant="muted" size="sm" onClick={onBack}>
          <ChevronLeft size={16} /> Back
        </Button>
        <h1 className="leaderboard-title font-display">Fastest Times</h1>
        <div style={{ width: 68 }} /> {/* spacer */}
      </div>

      <div className="leaderboard-tabs">
        {STAGES.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStageId(s.id)}
            className={`leaderboard-tab-btn ${
              activeStageId === s.id ? "active" : ""
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="leaderboard-card solid-card anim-slide-up">
        {entries.length === 0 ? (
          <div className="leaderboard-empty">
            <Trophy size={48} color="var(--text-muted)" />
            <p>No high scores yet for this stage.<br />Be the first to set a record!</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {entries.map((entry, idx) => (
              <div key={entry.id} className="leaderboard-row anim-pop">
                <div className="leaderboard-row-left">
                  <span className={`leaderboard-rank rank-${idx + 1}`}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`}
                  </span>
                  <span className="leaderboard-name">{entry.name}</span>
                </div>

                <div className="leaderboard-row-right">
                  <div className="leaderboard-stat">
                    <span>Time</span>
                    <span className="leaderboard-stat-val">
                      {formatTime(entry.time)}
                    </span>
                  </div>
                  <div className="leaderboard-stat">
                    <span>Accuracy</span>
                    <span className="leaderboard-stat-val">
                      {entry.accuracy}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
