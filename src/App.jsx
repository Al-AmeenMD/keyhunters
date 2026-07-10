import React, { useState, useEffect, useRef } from "react";
import { GameProvider, useGame } from "./context/GameContext";
import Welcome from "./pages/Welcome/Welcome";
import StageSelect from "./pages/StageSelect/StageSelect";
import Game from "./pages/Game/Game";
import Results from "./pages/Results/Results";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import ParentSettings, { ParentalGate } from "./pages/ParentSettings/ParentSettings";
import Button from "./components/Button/Button";
import { Trophy, Settings } from "lucide-react";
import { useAudio } from "./hooks/useAudio";

function MainAppContent() {
  const [currentPage, setCurrentPage] = useState("welcome"); // welcome, stages, game, results, leaderboard, parent-settings
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [resultsData, setResultsData] = useState(null);
  const [showGate, setShowGate] = useState(false);
  const [gateTargetPage, setGateTargetPage] = useState("");

  const { theme, soundOn, musicOn, activeToasts } = useGame();

  // Load useAudio globally so that music looping states sync automatically
  const { playAchievement } = useAudio(soundOn, musicOn);

  // Play achievement sound on toast notification
  const prevToastsLength = useRef(0);
  useEffect(() => {
    if (activeToasts && activeToasts.length > prevToastsLength.current) {
      playAchievement();
    }
    prevToastsLength.current = activeToasts ? activeToasts.length : 0;
  }, [activeToasts, playAchievement]);

  const handleStartGame = () => {
    setCurrentPage("stages");
  };

  const handleSelectStage = (idx) => {
    setActiveStageIdx(idx);
    setCurrentPage("game");
  };

  const handleStageFinished = (data) => {
    setResultsData(data);
    setCurrentPage("results");
  };

  const handleReplay = () => {
    setCurrentPage("game");
  };

  const handleNextStage = () => {
    const nextIdx = activeStageIdx + 1;
    setActiveStageIdx(nextIdx);
    setCurrentPage("game");
  };

  const triggerParentalGate = (target) => {
    setGateTargetPage(target);
    setShowGate(true);
  };

  return (
    <div style={{ minHeight: "100vh" }} data-theme={theme}>
      {/* Dynamic Toast Alerts Container */}
      <div className="toast-container">
        {activeToasts &&
          activeToasts.map((t) => (
            <div key={t.id} className="toast-item anim-slide-down">
              <span className="toast-badge">🏆</span>
              <div className="toast-info">
                <span className="toast-title">{t.title}</span>
                <span className="toast-desc">{t.description}</span>
              </div>
            </div>
          ))}
      </div>

      {/* Pages rendering */}
      {currentPage === "welcome" && (
        <>
          <Welcome
            onStartGame={handleStartGame}
            soundOn={soundOn}
            setSoundOn={() => {}} // soundOn setter is globally handled inside GameContext, welcome does not need state setters
          />
          
          <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 10, display: "flex", gap: 10 }}>
            <Button
              variant="muted"
              onClick={() => triggerParentalGate("parent-settings")}
              style={{
                borderRadius: "50%",
                width: 50,
                height: 50,
                padding: 0,
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
              title="Parent Dashboard"
            >
              <Settings size={20} />
            </Button>
            <Button
              variant="muted"
              onClick={() => setCurrentPage("leaderboard")}
              style={{
                borderRadius: "50%",
                width: 50,
                height: 50,
                padding: 0,
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
              title="Leaderboard"
            >
              <Trophy size={20} />
            </Button>
          </div>
        </>
      )}

      {currentPage === "stages" && (
        <StageSelect
          onSelectStage={handleSelectStage}
          onBackToWelcome={() => setCurrentPage("welcome")}
        />
      )}

      {currentPage === "game" && (
        <Game
          stageIndex={activeStageIdx}
          onBackToStages={() => setCurrentPage("stages")}
          onStageFinished={handleStageFinished}
          soundOn={soundOn}
          setSoundOn={() => {}}
        />
      )}

      {currentPage === "results" && (
        <Results
          stageIndex={activeStageIdx}
          resultsData={resultsData}
          onReplay={handleReplay}
          onNextStage={handleNextStage}
          onBackToStages={() => setCurrentPage("stages")}
          soundOn={soundOn}
        />
      )}

      {currentPage === "leaderboard" && (
        <Leaderboard onBack={() => setCurrentPage("welcome")} />
      )}

      {currentPage === "parent-settings" && (
        <ParentSettings onBack={() => setCurrentPage("welcome")} />
      )}

      {/* Parental Gate challenge overlay */}
      {showGate && (
        <ParentalGate
          onPass={() => {
            setShowGate(false);
            setCurrentPage(gateTargetPage);
          }}
          onFail={() => {
            setShowGate(false);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <MainAppContent />
    </GameProvider>
  );
}
