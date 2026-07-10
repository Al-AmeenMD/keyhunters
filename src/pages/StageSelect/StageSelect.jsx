import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import { isStageUnlocked } from "../../data/stages";
import { ACHIEVEMENTS } from "../../utils/achievements";
import Button from "../../components/Button/Button";
import { formatTime } from "../../utils/helpers";
import { Trophy, ShieldAlert, Award, ChevronLeft, Lock } from "lucide-react";
import "./StageSelect.css";

export default function StageSelect({ onSelectStage, onBackToWelcome }) {
  const {
    activeProfile,
    completedStages,
    bestTimes,
    achievements,
    theme,
    STAGES,
  } = useGame();

  const [showAchievements, setShowAchievements] = useState(false);

  if (!activeProfile) return null;

  return (
    <div className="stages-container" data-theme={theme}>
      <div className="stages-header anim-slide-down">
        <div className="stages-user-badge">
          <span className="stages-user-avatar">{activeProfile.avatar}</span>
          <span className="stages-user-name">Hi, {activeProfile.name}!</span>
        </div>

        <div className="stages-nav-btns">
          <Button variant="muted" size="sm" onClick={onBackToWelcome}>
            <ChevronLeft size={16} /> Switch Player
          </Button>
          <Button variant="success" size="sm" onClick={() => setShowAchievements(true)}>
            <Award size={16} /> Achievements ({achievements.length})
          </Button>
        </div>
      </div>

      <div className="stages-grid">
        {STAGES.map((s, idx) => {
          const unlocked = isStageUnlocked(s.id, completedStages);
          const bestTime = bestTimes[s.id];

          return (
            <div
              key={s.id}
              className={`stage-card solid-card anim-slide-up ${
                !unlocked ? "is-locked" : ""
              }`}
              style={{ animationDelay: `${idx * 0.08}s` }}
              onClick={() => unlocked && onSelectStage(idx)}
            >
              <div
                className="stage-card-emoji-wrapper"
                style={{ background: `${s.color}22` }}
              >
                {s.emoji}
              </div>

              <h3 className="stage-card-title">{s.name}</h3>
              <p className="stage-card-desc">{s.description}</p>

              {unlocked ? (
                <div className="stage-card-stats">
                  <div>
                    Best Time
                    <span className="stage-card-stat-val">
                      {bestTime !== undefined ? formatTime(bestTime) : "—"}
                    </span>
                  </div>
                  <div>
                    Status
                    <span
                      className="stage-card-stat-val"
                      style={{
                        color: completedStages.includes(s.id)
                          ? "var(--accent-success-dark)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {completedStages.includes(s.id) ? "Complete" : "New"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="stage-card-locked-overlay">
                  <Lock className="stage-card-lock-icon" size={28} />
                  <span>Locked</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Achievements Drawer */}
      {showAchievements && (
        <div
          className="achievements-drawer-overlay anim-pop"
          onClick={() => setShowAchievements(false)}
        >
          <div
            className="achievements-drawer anim-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="achievements-drawer-header">
              <h2 className="achievements-drawer-title font-display">My Badges</h2>
              <Button variant="muted" size="sm" onClick={() => setShowAchievements(false)}>
                Close
              </Button>
            </div>

            <div className="achievements-list">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = achievements.includes(a.id);
                return (
                  <div
                    key={a.id}
                    className={`achievement-row ${!unlocked ? "is-locked" : ""}`}
                  >
                    <div className="achievement-row-emoji">
                      {unlocked ? a.emoji : "🔒"}
                    </div>
                    <div className="achievement-row-info">
                      <span className="achievement-row-name">{a.name}</span>
                      <span className="achievement-row-desc">{a.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
