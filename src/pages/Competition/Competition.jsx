import React, { useState, useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { buildQueue } from "../../data/stages";
import Button from "../../components/Button/Button";
import Game from "../Game/Game";
import { formatTime } from "../../utils/helpers";
import { useConfetti } from "../../components/ParticleEffects/Confetti";
import { useAudio } from "../../hooks/useAudio";
import { ChevronLeft, Play, UserCheck, Trophy } from "lucide-react";
import "./Competition.css";

export default function Competition({ onBack }) {
  const { profiles, STAGES, theme, soundOn, musicOn } = useGame();
  
  const [battleState, setBattleState] = useState("setup"); // setup, ready, playing, podium
  const [selectedPlayerIndices, setSelectedPlayerIndices] = useState([]);
  const [selectedStageIdx, setSelectedStageIdx] = useState(0);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  
  const [battleQueue, setBattleQueue] = useState([]);
  const [battleResults, setBattleResults] = useState([]); // Array of { name, avatar, time, accuracy }
  
  const { fireBig } = useConfetti();
  const { playFanfare, playTone } = useAudio(soundOn, musicOn);
  
  const selectedPlayers = selectedPlayerIndices.map((idx) => profiles[idx]).filter(Boolean);
  const activePlayer = selectedPlayers[currentPlayerIdx];
  const stage = STAGES[selectedStageIdx];

  // Auto-fill active profile if exists on mount
  useEffect(() => {
    if (profiles.length >= 2 && selectedPlayerIndices.length === 0) {
      setSelectedPlayerIndices([0, 1]); // Default select first two players
    }
  }, [profiles, selectedPlayerIndices.length]);

  const togglePlayerSelect = (idx) => {
    setSelectedPlayerIndices((prev) => {
      if (prev.includes(idx)) {
        return prev.filter((i) => i !== idx);
      } else {
        if (prev.length >= 4) {
          alert("Maximum of 4 players can join the battle!");
          return prev;
        }
        return [...prev, idx];
      }
    });
  };

  const handleStartBattle = () => {
    if (selectedPlayers.length < 2) {
      alert("At least 2 players must be selected to start a competition!");
      return;
    }
    // Pre-generate the exact same queue for everyone
    const queue = buildQueue(stage, true);
    setBattleQueue(queue);
    setBattleResults([]);
    setCurrentPlayerIdx(0);
    setBattleState("ready");
  };

  const handlePlayerStart = () => {
    setBattleState("playing");
  };

  const calculateScore = (time, accuracy, streak, stageType, wordsTyped) => {
    const base = wordsTyped * 50;
    const accBonus = accuracy * 10;
    const streakBonus = streak * 20;
    const speedBonus = stageType !== "timed" ? Math.max(0, 180 - time) * 10 : 0;
    return Math.round(base + accBonus + streakBonus + speedBonus);
  };

  const handlePlayerFinished = (results) => {
    const score = calculateScore(
      results.time,
      results.accuracy,
      results.streak,
      stage.type,
      results.wordsTyped
    );

    const playerResult = {
      name: activePlayer.name,
      avatar: activePlayer.avatar,
      time: results.time,
      accuracy: results.accuracy,
      streak: results.streak,
      score: score,
    };
    
    setBattleResults((prev) => [...prev, playerResult]);

    const nextIdx = currentPlayerIdx + 1;
    if (nextIdx < selectedPlayers.length) {
      setCurrentPlayerIdx(nextIdx);
      setBattleState("ready");
    } else {
      setBattleState("podium");
    }
  };

  // Sort results for the podium (highest score first)
  const sortedResults = [...battleResults].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time - b.time;
  });

  // Confetti trigger when podium renders
  useEffect(() => {
    if (battleState === "podium") {
      playFanfare();
      setTimeout(() => fireBig(), 250);
    }
  }, [battleState, playFanfare, fireBig]);

  if (battleState === "playing") {
    return (
      <div style={{ minHeight: "100vh" }} data-theme={theme}>
        {/* Battle HUD */}
        <div className="comp-hud font-display anim-slide-down" style={{ maxWidth: 900, margin: "20px auto 0 auto" }}>
          <div className="comp-hud-player">
            <span className="comp-hud-avatar">{activePlayer.avatar}</span>
            <span>{activePlayer.name}'s Turn</span>
          </div>
          <span className="comp-hud-round">
            Player {currentPlayerIdx + 1} of {selectedPlayers.length}
          </span>
        </div>

        <Game
          stageIndex={selectedStageIdx}
          onBackToStages={() => setBattleState("setup")}
          onStageFinished={handlePlayerFinished}
          customQueue={battleQueue}
        />
      </div>
    );
  }

  if (battleState === "ready") {
    return (
      <div className="comp-ready-container" data-theme={theme}>
        <div className="comp-ready-card solid-card anim-pop">
          <div className="comp-ready-avatar">{activePlayer.avatar}</div>
          <h2 className="comp-ready-title font-display">Get Ready!</h2>
          <p className="comp-ready-desc">Pass the keyboard to {activePlayer.name}</p>
          <Button variant="success" size="lg" onClick={handlePlayerStart} style={{ width: "100%" }}>
            Start My Turn! 🚀
          </Button>
        </div>
      </div>
    );
  }

  if (battleState === "podium") {
    const gold = sortedResults[0];
    const silver = sortedResults[1];
    const bronze = sortedResults[2];

    return (
      <div className="comp-container" data-theme={theme}>
        <div className="comp-header anim-slide-down">
          <Button variant="muted" size="sm" onClick={() => setBattleState("setup")}>
            <ChevronLeft size={16} /> Setup
          </Button>
          <h1 className="comp-title font-display">Battle Results</h1>
          <div style={{ width: 68 }} />
        </div>

        <div className="comp-card solid-card anim-slide-up">
          <div className="comp-podium-wrapper">
            {/* 2nd Place */}
            {silver && (
              <div className="comp-podium-col podium-2">
                <span className="comp-podium-avatar">{silver.avatar}</span>
                <span className="comp-podium-name">{silver.name}</span>
                <span className="comp-podium-stat">{silver.score} Pts</span>
                <span className="comp-podium-stat" style={{ opacity: 0.8, fontSize: "0.65rem" }}>
                  {formatTime(silver.time)} ({silver.accuracy}%)
                </span>
                <span className="comp-podium-stat" style={{ opacity: 0.8 }}>🥈 2nd</span>
              </div>
            )}

            {/* 1st Place */}
            {gold && (
              <div className="comp-podium-col podium-1">
                <span className="comp-podium-avatar">{gold.avatar}</span>
                <span className="comp-podium-name">{gold.name}</span>
                <span className="comp-podium-stat" style={{ fontWeight: "bold" }}>{gold.score} Pts</span>
                <span className="comp-podium-stat" style={{ opacity: 0.8, fontSize: "0.65rem" }}>
                  {formatTime(gold.time)} ({gold.accuracy}%)
                </span>
                <span className="comp-podium-stat" style={{ opacity: 0.8 }}>👑 Winner</span>
              </div>
            )}

            {/* 3rd Place */}
            {bronze && (
              <div className="comp-podium-col podium-3">
                <span className="comp-podium-avatar">{bronze.avatar}</span>
                <span className="comp-podium-name">{bronze.name}</span>
                <span className="comp-podium-stat">{bronze.score} Pts</span>
                <span className="comp-podium-stat" style={{ opacity: 0.8, fontSize: "0.65rem" }}>
                  {formatTime(bronze.time)} ({bronze.accuracy}%)
                </span>
                <span className="comp-podium-stat" style={{ opacity: 0.8 }}>🥉 3rd</span>
              </div>
            )}
          </div>

          <div className="comp-winners-list">
            <h3 className="comp-section-title">Scoreboard</h3>
            {sortedResults.map((r, i) => (
              <div key={r.name} className="comp-winner-row anim-pop" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="comp-winner-row-left">
                  <span className="comp-winner-rank">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                  </span>
                  <span>{r.avatar} {r.name}</span>
                </div>
                <div className="comp-winner-row-right">
                  <span>Score: <strong className="comp-winner-val" style={{ color: "var(--accent-gold-dark)" }}>{r.score} Pts</strong></span>
                  <span>Time: <strong className="comp-winner-val">{formatTime(r.time)}</strong></span>
                  <span>Accuracy: <strong className="comp-winner-val">{r.accuracy}%</strong></span>
                  <span>Streak: <strong className="comp-winner-val">{r.streak}🔥</strong></span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="success" onClick={handleStartBattle} style={{ flex: 1 }}>
              Rematch! 🔄
            </Button>
            <Button variant="muted" onClick={onBack} style={{ flex: 1 }}>
              Exit Battle
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="comp-container" data-theme={theme}>
      <div className="comp-header anim-slide-down">
        <Button variant="muted" size="sm" onClick={onBack}>
          <ChevronLeft size={16} /> Back
        </Button>
        <h1 className="comp-title font-display">Classroom Battle</h1>
        <div style={{ width: 68 }} />
      </div>

      <div className="comp-card solid-card anim-slide-up">
        {/* Step 1: Select Students */}
        <div>
          <h2 className="comp-section-title">1. Select Players (2-4)</h2>
          {profiles.length < 2 ? (
            <p style={{ color: "var(--accent-error-dark)", fontWeight: 700, fontSize: 14 }}>
              ⚠️ You need to create at least 2 player profiles in the Welcome screen to battle!
            </p>
          ) : (
            <div className="comp-picker-grid">
              {profiles.map((p, i) => {
                const isSelected = selectedPlayerIndices.includes(i);
                const joinIndex = selectedPlayerIndices.indexOf(i) + 1;
                return (
                  <button
                    key={p.name}
                    className={`comp-picker-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => togglePlayerSelect(i)}
                  >
                    <div className="comp-picker-avatar">{p.avatar}</div>
                    <span className="comp-picker-name">{p.name}</span>
                    {isSelected && <span className="comp-picker-badge">{joinIndex}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: Select Stage */}
        <div>
          <h2 className="comp-section-title">2. Choose Stage</h2>
          <div className="comp-stages-list">
            {STAGES.map((s, idx) => (
              <button
                key={s.id}
                className={`comp-stage-item-btn ${selectedStageIdx === idx ? "selected" : ""}`}
                onClick={() => setSelectedStageIdx(idx)}
              >
                <span>{s.emoji}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="gold"
          size="lg"
          onClick={handleStartBattle}
          disabled={selectedPlayers.length < 2}
          style={{ width: "100%", marginTop: 10 }}
        >
          <Play size={18} fill="currentColor" /> Let's Battle!
        </Button>
      </div>
    </div>
  );
}
