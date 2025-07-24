import React, { useState } from "react";
import "./App.css";

function App() {
  const [green, setGreen] = useState([""]);
  const [yellow, setYellow] = useState([""]);
  const [gray, setGray] = useState("");
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handlers for dynamic green/yellow fields
  const handleGreenChange = (idx, value) => {
    const updated = [...green];
    updated[idx] = value.toLowerCase();
    setGreen(updated);
  };

  const handleYellowChange = (idx, value) => {
    const updated = [...yellow];
    updated[idx] = value.toLowerCase();
    setYellow(updated);
  };

  const addGreenField = () => setGreen([...green, ""]);
  const addYellowField = () => setYellow([...yellow, ""]);

  const removeGreenField = (idx) => {
    if (green.length > 1) {
      const updated = green.filter((_, i) => i !== idx);
      setGreen(updated);
    }
  };

  const removeYellowField = (idx) => {
    if (yellow.length > 1) {
      const updated = yellow.filter((_, i) => i !== idx);
      setYellow(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSolutions([]);
    try {
      const response = await fetch("http://localhost:5000/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          green: green.filter((g) => g.trim() !== ""),
          yellow: yellow.filter((y) => y.trim() !== ""),
          gray: gray.trim() ? [gray.trim()] : [],
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSolutions(data.solutions);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err) {
      setError("Failed to connect to backend.");
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">🟩 Wordle Helper</h1>
          <p className="subtitle">Find possible solutions for your Wordle puzzle</p>
        </header>

        <div className="card">
          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <label className="label">
                <span className="label-text">🟩 Green Letters (correct position)</span>
                <span className="label-hint">Use _ for unknown positions (e.g., _a___)</span>
              </label>
              <div className="input-row">
                {green.map((g, idx) => (
                  <div key={idx} className="input-with-controls">
                    <input
                      type="text"
                      maxLength={5}
                      value={g}
                      onChange={(e) => handleGreenChange(idx, e.target.value)}
                      placeholder="_____"
                      className="letter-input green-input"
                    />
                    {green.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGreenField(idx)}
                        className="remove-btn"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addGreenField} className="add-btn">
                  + Add
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="label">
                <span className="label-text">🟨 Yellow Letters (wrong position)</span>
                <span className="label-hint">Mark positions where letters appear but are wrong</span>
              </label>
              <div className="input-row">
                {yellow.map((y, idx) => (
                  <div key={idx} className="input-with-controls">
                    <input
                      type="text"
                      maxLength={5}
                      value={y}
                      onChange={(e) => handleYellowChange(idx, e.target.value)}
                      placeholder="_____"
                      className="letter-input yellow-input"
                    />
                    {yellow.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeYellowField(idx)}
                        className="remove-btn"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addYellowField} className="add-btn">
                  + Add
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="label">
                <span className="label-text">⬜ Gray Letters (not in word)</span>
                <span className="label-hint">Letters that don't appear in the word</span>
              </label>
              <input
                type="text"
                value={gray}
                onChange={(e) => setGray(e.target.value.toLowerCase())}
                placeholder="Enter gray letters..."
                className="text-input gray-input"
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Solving...
                </>
              ) : (
                "🔍 Find Solutions"
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="error-card">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="results-card">
          <h2 className="results-title">
            Possible Solutions
            {solutions.length > 0 && (
              <span className="results-count">({solutions.length} found)</span>
            )}
          </h2>
          {solutions.length === 0 ? (
            <div className="no-results">
              <span className="no-results-icon">🤔</span>
              <p>No solutions yet. Enter your clues above to get started!</p>
            </div>
          ) : (
            <div className="solutions-grid">
              {solutions.map((word, idx) => (
                <div key={idx} className="solution-item">
                  {word.toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;