import React from "react";
import "./ProgressBar.css";

export default function ProgressBar({ current, total }) {
  const radius = 21;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? Math.min(current, total) / total : 0;
  const dashoffset = circumference * (1 - progress);

  const strokeColor =
    progress >= 1
      ? "var(--accent-success)"
      : progress > 0.6
      ? "var(--accent-gold)"
      : "var(--accent-purple)";

  return (
    <div className="progress-container">
      <svg className="progress-ring" width="52" height="52" viewBox="0 0 52 52">
        <circle className="progress-ring-track" cx="26" cy="26" r={radius} />
        <circle
          className="progress-ring-fill"
          cx="26"
          cy="26"
          r={radius}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: dashoffset,
            stroke: strokeColor,
          }}
        />
      </svg>
      <div className="progress-text">
        {Math.min(current, total)}/{total}
      </div>
    </div>
  );
}
