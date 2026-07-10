import React from "react";

export default function FloatingPoints({ points }) {
  return (
    <>
      {points.map((p) => (
        <div
          key={p.id}
          className="anim-float-up font-display"
          style={{
            position: "fixed",
            left: p.x,
            top: p.y,
            color: "var(--accent-gold-dark)",
            fontWeight: 700,
            fontSize: 24,
            zIndex: 60,
            pointerEvents: "none",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          +1 ⭐
        </div>
      ))}
    </>
  );
}
