import React, { useState, useEffect } from "react";
import { useGame, AVATARS } from "../../context/GameContext";
import Button from "../../components/Button/Button";
import { Volume2, VolumeX, Moon, Sun, Plus } from "lucide-react";
import "./Welcome.css";

export default function Welcome({ onStartGame }) {
  const {
    profiles,
    activeProfileIndex,
    theme,
    setTheme,
    createProfile,
    selectProfile,
    soundOn,
    setSoundOn,
  } = useGame();

  const [nameInput, setNameInput] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    if (profiles.length === 0) {
      setIsCreatingNew(true);
    } else {
      setIsCreatingNew(false);
    }
  }, [profiles.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCreatingNew) {
      if (!nameInput.trim()) return;
      createProfile(nameInput.trim(), selectedAvatar);
      setNameInput("");
      setIsCreatingNew(false);
    } else {
      if (activeProfileIndex >= 0) {
        onStartGame();
      }
    }
  };

  const handleProfileClick = (idx) => {
    selectProfile(idx);
  };

  return (
    <div className="welcome-container" data-theme={theme}>
      <div className="welcome-floating-bg">⌨️</div>
      <div className="welcome-floating-bg-2">🚀</div>

      <div className="theme-toggle-wrapper">
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="theme-toggle-btn"
          title={soundOn ? "Mute sound" : "Unmute sound"}
        >
          {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <button
          onClick={() => setTheme(theme === "dark" ? "pastel" : "dark")}
          className="theme-toggle-btn"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="welcome-logo">⌨️</div>
      <h1 className="welcome-title font-display">Key Hunters Pro</h1>

      <div className="welcome-card solid-card anim-pop">
        {/* Profile list section */}
        {!isCreatingNew && profiles.length > 0 && (
          <div>
            <h2 className="welcome-section-title">Who is playing today?</h2>
            <div className="profiles-grid">
              {profiles.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className={`profile-select-btn ${
                    activeProfileIndex === i ? "is-active" : ""
                  }`}
                  onClick={() => handleProfileClick(i)}
                >
                  <div className="profile-avatar-circle">{p.avatar}</div>
                  <span className="profile-name">{p.name}</span>
                </button>
              ))}
              {profiles.length < 4 && (
                <button
                  type="button"
                  className="profile-select-btn"
                  onClick={() => setIsCreatingNew(true)}
                >
                  <div className="profile-avatar-circle" style={{ border: "2px dashed var(--text-muted)", background: "transparent" }}>
                    <Plus size={24} color="var(--text-secondary)" />
                  </div>
                  <span className="profile-name" style={{ color: "var(--text-secondary)" }}>New Player</span>
                </button>
              )}
            </div>

            <Button
              variant="gold"
              size="lg"
              onClick={onStartGame}
              disabled={activeProfileIndex < 0}
              style={{ width: "100%" }}
            >
              Let's Hunt! 🏹
            </Button>
          </div>
        )}

        {/* Profile creation form */}
        {isCreatingNew && (
          <form className="create-profile-form" onSubmit={handleSubmit}>
            <h2 className="welcome-section-title">Create a new Player</h2>
            <input
              type="text"
              autoFocus
              className="input-name"
              placeholder="Type your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={12}
              required
            />

            <h3 className="welcome-section-title" style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
              Choose your avatar
            </h3>
            <div className="avatar-selector">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  className={`avatar-opt-btn ${
                    selectedAvatar === av ? "selected" : ""
                  }`}
                  onClick={() => setSelectedAvatar(av)}
                >
                  {av}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              {profiles.length > 0 && (
                <Button
                  variant="muted"
                  type="button"
                  style={{ flex: 1 }}
                  onClick={() => setIsCreatingNew(false)}
                >
                  Back
                </Button>
              )}
              <Button variant="success" type="submit" style={{ flex: 1 }}>
                Create Player!
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
