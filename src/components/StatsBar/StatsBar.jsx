import React from "react";
import { Clock, Trophy, Flame } from "lucide-react";
import ProgressBar from "../ProgressBar/ProgressBar";
import { formatTime } from "../../utils/helpers";
import "./StatsBar.css";

export default function StatsBar({
  seconds,
  remaining,
  bestTime,
  posIndex,
  total,
  streak,
  isTimed,
}) {
  return (
    <div className="stats-bar">
      <div className="stat-pill">
        <Clock size={16} color="var(--text-primary)" />
        <span className="stat-value">
          {isTimed ? formatTime(remaining ?? 0) : formatTime(seconds)}
        </span>
      </div>

      {bestTime !== undefined && (
        <div className="stat-pill">
          <Trophy size={16} color="var(--accent-gold)" />
          <span className="stat-value" style={{ color: "var(--accent-gold-dark)" }}>
            Best: {formatTime(bestTime)}
          </span>
        </div>
      )}

      <ProgressBar current={posIndex} total={total} />

      {streak >= 3 && (
        <div className={`streak-badge ${streak >= 10 ? "is-hot anim-streak" : ""}`}>
          <Flame size={16} />
          {streak}🔥
        </div>
      )}
    </div>
  );
}
