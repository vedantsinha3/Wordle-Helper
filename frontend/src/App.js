import React, { useState } from "react";
import "./App.css";

const COLORS = ["blank", "gray", "yellow", "green"];
const COLOR_CLASSES = {
  blank: "cell-blank",
  gray: "cell-gray",
  yellow: "cell-yellow",
  green: "cell-green",
};

function nextColor(current) {
  const idx = COLORS.indexOf(current);
  return COLORS[(idx + 1) % COLORS.length];
}

function App() {
  const [grid, setGrid] = useState([
    Array(5).fill({ letter: "", color: "blank" }),
  ]);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Add a new guess row
  const addRow = () => {
    setGrid([...grid, Array(5).fill({ letter: "", color: "blank" })]);
  };

  // Remove the last guess row
  const removeRow = () => {
    if (grid.length > 1) setGrid(grid.slice(0, -1));
  };

  // Handle letter input
  const handleLetterChange = (rowIdx, colIdx, value) => {
    if (value.length > 1) return;
    setGrid((prev) =>
      prev.map((row, r) =>
        r === rowIdx
          ? row.map((cell, c) =>
              c === colIdx
                ? { ...cell, letter: value.replace(/[^a-zA-Z]/, "").toLowerCase() }
                : cell
            )
          : row
      )
    );
  };

  // Handle color cycling
  const handleCellClick = (rowIdx, colIdx) => {
    setGrid((prev) =>
      prev.map((row, r) =>
        r === rowIdx
          ? row.map((cell, c) =>
              c === colIdx
                ? { ...cell, color: nextColor(cell.color) }
                : cell
            )
          : row
      )
    );
  };

  // Convert grid to backend format
  const convertGridToFeedback = () => {
    const green = [];
    const yellow = [];
    let grayLetters = new Set();
    let greenYellowLetters = new Set();
    // First pass: collect all green and yellow letters
    grid.forEach((row) => {
      row.forEach((cell) => {
        if ((cell.color === "green" || cell.color === "yellow") && cell.letter) {
          greenYellowLetters.add(cell.letter);
        }
      });
    });
    // Second pass: build green/yellow rows and gray set
    grid.forEach((row) => {
      let greenRow = "";
      let yellowRow = "";
      row.forEach((cell) => {
        if (cell.color === "green") {
          greenRow += cell.letter || "_";
          yellowRow += "_";
        } else if (cell.color === "yellow") {
          greenRow += "_";
          yellowRow += cell.letter || "_";
        } else if (cell.color === "gray") {
          greenRow += "_";
          yellowRow += "_";
          if (cell.letter && !greenYellowLetters.has(cell.letter)) {
            grayLetters.add(cell.letter);
          }
        } else {
          greenRow += "_";
          yellowRow += "_";
        }
      });
      if (greenRow !== "_____") green.push(greenRow);
      if (yellowRow !== "_____") yellow.push(yellowRow);
    });
    return {
      green,
      yellow,
      gray: Array.from(grayLetters),
    };
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSolutions([]);
    const { green, yellow, gray } = convertGridToFeedback();
    // Validation: all rows must be 5 letters or blank
    for (const row of grid) {
      for (const cell of row) {
        if (cell.letter && cell.letter.length !== 1) {
          setError("Each cell must be a single letter or blank.");
          return;
        }
      }
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ green, yellow, gray }),
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
          <h1 className="title">Wordle Helper</h1>
          <p className="subtitle">Click cells to set color, type letters for your guesses!</p>
        </header>
        <div className="card">
          <form onSubmit={handleSubmit} className="form">
            <div className="grid-input-section">
              {grid.map((row, rowIdx) => (
                <div className="wordle-row" key={rowIdx}>
                  {row.map((cell, colIdx) => (
                    <input
                      key={colIdx}
                      type="text"
                      maxLength={1}
                      value={cell.letter}
                      className={`wordle-cell ${COLOR_CLASSES[cell.color]}`}
                      onChange={(e) => handleLetterChange(rowIdx, colIdx, e.target.value)}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                      autoComplete="off"
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="grid-controls">
              <button type="button" className="add-btn" onClick={addRow}>+ Add Row</button>
              <button
                type="button"
                className="remove-row-btn"
                onClick={removeRow}
                disabled={grid.length === 1}
                title="Remove last row"
                aria-label="Remove last row"
              >
                <span style={{fontSize: '1.5rem', lineHeight: 1, display: 'block', fontWeight: 'bold'}}>&minus;</span>
              </button>
            </div>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Solving...
                </>
              ) : (
                "Find Solutions"
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
              <span className="no-results-icon"></span>
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