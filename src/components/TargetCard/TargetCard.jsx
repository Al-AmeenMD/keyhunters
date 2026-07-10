import React from "react";
import "./TargetCard.css";

export default function TargetCard({ item, typedIndex, wrongFlash, cardRef }) {
  if (!item) return null;

  return (
    <div
      ref={cardRef}
      className={`target-card anim-pop ${wrongFlash ? "anim-shake" : ""}`}
    >
      <div className="target-emoji">{item.emoji}</div>

      {item.kind === "letter" ? (
        <>
          <div className="target-letter">{item.letter}</div>
          <div className="target-hint">
            {item.letter} is for {item.word}
          </div>
        </>
      ) : (
        <>
          <div className="word-tiles">
            {item.word.split("").map((ch, i) => {
              let tileClass = "pending";
              if (i < typedIndex) tileClass = "typed";
              else if (i === typedIndex) tileClass = "current";

              return (
                <span
                  key={i}
                  className={`word-tile ${tileClass} ${i < typedIndex ? "anim-pop" : ""}`}
                >
                  {ch}
                </span>
              );
            })}
          </div>
          {item.label && (
            <div className="target-hint" style={{ marginTop: 10 }}>
              {item.label}
            </div>
          )}
        </>
      )}
    </div>
  );
}
