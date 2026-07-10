import React from "react";
import "./Keyboard.css";

const KEY_ROWS_EXTENDED = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
  ["SHIFT_L", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "SHIFT_R"]
];

const LEFT_HAND = new Set([
  "1", "2", "3", "4", "5",
  "Q", "W", "E", "R", "T",
  "A", "S", "D", "F", "G",
  "SHIFT_L", "Z", "X", "C", "V", "B"
]);

const FINGER_MAP = {
  // Row 1
  "1": "Pinky", "2": "Ring", "3": "Middle", "4": "Index", "5": "Index",
  "6": "Index", "7": "Index", "8": "Middle", "9": "Ring", "0": "Pinky",
  "-": "Pinky", "=": "Pinky",
  // Row 2
  Q: "Pinky", W: "Ring", E: "Middle", R: "Index", T: "Index",
  Y: "Index", U: "Index", I: "Middle", O: "Ring", P: "Pinky",
  "[": "Pinky", "]": "Pinky",
  // Row 3
  A: "Pinky", S: "Ring", D: "Middle", F: "Index", G: "Index",
  H: "Index", J: "Index", K: "Middle", L: "Ring", ";": "Pinky",
  // Row 4
  Z: "Pinky", X: "Ring", C: "Middle", V: "Index", B: "Index",
  N: "Index", M: "Index", ",": "Middle", ".": "Ring", "/": "Pinky"
};

const KEY_MAP = {
  "1": { key: "1", shift: false }, "!": { key: "1", shift: true },
  "2": { key: "2", shift: false }, "@": { key: "2", shift: true },
  "3": { key: "3", shift: false }, "#": { key: "3", shift: true },
  "4": { key: "4", shift: false }, "$": { key: "4", shift: true },
  "5": { key: "5", shift: false }, "%": { key: "5", shift: true },
  "6": { key: "6", shift: false }, "^": { key: "6", shift: true },
  "7": { key: "7", shift: false }, "&": { key: "7", shift: true },
  "8": { key: "8", shift: false }, "*": { key: "8", shift: true },
  "9": { key: "9", shift: false }, "(": { key: "9", shift: true },
  "0": { key: "0", shift: false }, ")": { key: "0", shift: true },
  "-": { key: "-", shift: false }, "_": { key: "-", shift: true },
  "=": { key: "=", shift: false }, "+": { key: "=", shift: true },
  "[": { key: "[", shift: false }, "{": { key: "[", shift: true },
  "]": { key: "]", shift: false }, "}": { key: "]", shift: true },
  ";": { key: ";", shift: false }, ":": { key: ";", shift: true },
  ",": { key: ",", shift: false }, "<": { key: ",", shift: true },
  ".": { key: ".", shift: false }, ">": { key: ".", shift: true },
  "/": { key: "/", shift: false }, "?": { key: "/", shift: true },
};

export function getFingerInstruction(target) {
  if (!target) return null;
  const t = target.toUpperCase();
  
  // Direct match for letters
  if (/^[A-Z]$/.test(t)) {
    const f = FINGER_MAP[t];
    const hand = LEFT_HAND.has(t) ? "Left" : "Right";
    return { keyName: t, finger: `${hand} ${f}`, shift: false };
  }

  // Lookup match for symbols/numbers
  const mapVal = KEY_MAP[target];
  if (mapVal) {
    const f = FINGER_MAP[mapVal.key];
    const hand = LEFT_HAND.has(mapVal.key) ? "Left" : "Right";
    return { keyName: mapVal.key, finger: `${hand} ${f}`, shift: mapVal.shift };
  }

  return null;
}

export default function Keyboard({ targetKey, pressedKey, onKeyClick, showFingerGuides }) {
  const instr = getFingerInstruction(targetKey);
  const primaryTargetKey = instr ? instr.keyName : null;
  const requiresShift = instr ? instr.shift : false;

  return (
    <div className="keyboard-container">
      {KEY_ROWS_EXTENDED.map((row, ri) => (
        <div key={ri} className="keyboard-row">
          {row.map((k) => {
            const isShiftKey = k === "SHIFT_L" || k === "SHIFT_R";
            const isTarget = isShiftKey ? (requiresShift) : (k === primaryTargetKey);
            const isPressed = k === pressedKey;
            const isLeft = LEFT_HAND.has(k);
            const finger = FINGER_MAP[k] || "";

            // Pretty key display names for layout
            let displayName = k;
            if (k === "SHIFT_L" || k === "SHIFT_R") displayName = "Shift";
            
            // Render secondary labels if symbol key
            let shiftName = "";
            if (k === "1") shiftName = "!";
            else if (k === "2") shiftName = "@";
            else if (k === "3") shiftName = "#";
            else if (k === "4") shiftName = "$";
            else if (k === "5") shiftName = "%";
            else if (k === "6") shiftName = "^";
            else if (k === "7") shiftName = "&";
            else if (k === "8") shiftName = "*";
            else if (k === "9") shiftName = "(";
            else if (k === "0") shiftName = ")";
            else if (k === "-") shiftName = "_";
            else if (k === "=") shiftName = "+";
            else if (k === "[") shiftName = "{";
            else if (k === "]") shiftName = "}";
            else if (k === ";") shiftName = ":";
            else if (k === ",") shiftName = "<";
            else if (k === ".") shiftName = ">";
            else if (k === "/") shiftName = "?";

            return (
              <button
                key={k}
                className={[
                  "keyboard-key",
                  "font-display",
                  isShiftKey ? "is-shift" : "",
                  isLeft ? "is-left" : "is-right",
                  isTarget ? "is-target anim-pulse" : "",
                  isPressed ? "is-pressed anim-key-press" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onPointerDown={(e) => {
                  e.preventDefault();
                  if (!isShiftKey) {
                    onKeyClick?.(requiresShift ? shiftName : k);
                  }
                }}
                tabIndex={-1}
                aria-label={`Key ${displayName}`}
              >
                {shiftName && <span className="key-shift-char">{shiftName}</span>}
                <span className="key-char">{displayName}</span>
                {showFingerGuides && finger && !isShiftKey && (
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

      {showFingerGuides && instr && (
        <div className="finger-instruction-banner font-display anim-pop">
          {requiresShift ? (
            <span>
              👉 Hold <strong style={{ color: "var(--accent-gold-dark)" }}>Shift</strong> + press <strong style={{ color: "var(--accent-purple)" }}>{primaryTargetKey}</strong>!
            </span>
          ) : (
            <span>
              👉 Use your <strong style={{ color: LEFT_HAND.has(primaryTargetKey) ? "var(--key-left-color)" : "var(--key-right-color)" }}>{instr.finger}</strong> finger!
            </span>
          )}
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
export { LEFT_HAND, FINGER_MAP, KEY_MAP };
