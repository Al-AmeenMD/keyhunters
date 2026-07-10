import React from "react";
import { KEY_ROWS, LEFT_HAND } from "../../data/stages";
import "./Keyboard.css";

const FINGER_MAP = {
  Q: "Pinky", A: "Pinky", Z: "Pinky",
  W: "Ring", S: "Ring", X: "Ring",
  E: "Middle", D: "Middle", C: "Middle",
  R: "Index", T: "Index", F: "Index", G: "Index", V: "Index", B: "Index",
  Y: "Index", U: "Index", H: "Index", J: "Index", N: "Index", M: "Index",
  I: "Middle", K: "Middle",
  O: "Ring", L: "Ring",
  P: "Pinky"
};

export function getFingerInstruction(key) {
  if (!key) return "";
  const f = FINGER_MAP[key.toUpperCase()];
  if (!f) return "";
  const hand = LEFT_HAND.has(key.toUpperCase()) ? "Left" : "Right";
  return `${hand} ${f}`;
}

export default function Keyboard({ targetKey, pressedKey, onKeyClick, showFingerGuides }) {
  const targetFinger = targetKey ? getFingerInstruction(targetKey) : "";

  return (
    <div className="keyboard-container">
      {KEY_ROWS.map((row, ri) => (
        <div key={ri} className="keyboard-row">
          {row.map((k) => {
            const isTarget = k === targetKey;
            const isPressed = k === pressedKey;
            const isLeft = LEFT_HAND.has(k);
            const finger = FINGER_MAP[k] || "";

            return (
              <button
                key={k}
                className={[
                  "keyboard-key",
                  "font-display",
                  isLeft ? "is-left" : "is-right",
                  isTarget ? "is-target anim-pulse" : "",
                  isPressed ? "is-pressed anim-key-press" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onPointerDown={(e) => {
                  e.preventDefault();
                  onKeyClick?.(k);
                }}
                tabIndex={-1}
                aria-label={`Key ${k}`}
              >
                <span className="key-char">{k}</span>
                {showFingerGuides && finger && (
                  <span className="key-finger-label">{finger.slice(0, 3)}</span>
                )}
              </button>
            );
          })}
        </div>
      ))}

      <div className="keyboard-spacebar">
        space
        {showFingerGuides && <span className="key-finger-label" style={{ bottom: 2 }}>Thumb</span>}
      </div>

      {showFingerGuides && targetFinger && (
        <div className="finger-instruction-banner font-display anim-pop">
          👉 Use your <strong style={{ color: LEFT_HAND.has(targetKey.toUpperCase()) ? "var(--key-left-color)" : "var(--key-right-color)" }}>{targetFinger}</strong> finger!
        </div>
      )}

      <div className="keyboard-legend">
        <span className="keyboard-legend-item">
          <span
            className="keyboard-legend-dot"
            style={{ background: "var(--key-left-bg)" }}
          />
          Left hand
        </span>
        <span className="keyboard-legend-item">
          <span
            className="keyboard-legend-dot"
            style={{ background: "var(--key-right-bg)" }}
          />
          Right hand
        </span>
      </div>
    </div>
  );
}
export { FINGER_MAP };
