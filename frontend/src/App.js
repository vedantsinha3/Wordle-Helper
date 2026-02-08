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
  const [nextBestGuesses, setNextBestGuesses] = useState([]);
  const [previousGuesses, setPreviousGuesses] = useState([]);
  const [solutionsCount, setSolutionsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOpeningWords, setShowOpeningWords] = useState(false);

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

  // Extract guessed words from grid
  const extractGuessedWords = () => {
    const guesses = [];
    for (const row of grid) {
      const word = row.map(cell => cell.letter).join('');
      if (word.length === 5 && word.replace(/[^a-z]/g, '').length === 5) {
        guesses.push(word);
      }
    }
    return guesses;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSolutions([]);
    setNextBestGuesses([]);
    setSolutionsCount(0);
    setShowOpeningWords(false);
    
    const { green, yellow, gray } = convertGridToFeedback();
    const currentGuesses = extractGuessedWords();
    
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
      const response = await fetch("http://localhost:5001/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          green, 
          yellow, 
          gray,
          previous_guesses: currentGuesses
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSolutions(data.solutions || []);
        setNextBestGuesses(data.next_best_guesses || []);
        setSolutionsCount(data.solutions_count || 0);
        setPreviousGuesses(currentGuesses);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err) {
      setError("Failed to connect to backend.");
    }
    setLoading(false);
  };

  // Get best opening words
  const handleGetOpeningWords = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/best_opening");
      const data = await response.json();
      if (response.ok) {
        setNextBestGuesses(data.best_opening_words || []);
        setShowOpeningWords(true);
        setSolutions([]);
        setSolutionsCount(0);
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
          <p className="subtitle">Click cells to cycle color (blank → gray → yellow → green). Type letters for guesses.</p>
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
                −
              </button>
            </div>
            <div className="button-group">
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
              <button 
                type="button" 
                onClick={handleGetOpeningWords} 
                disabled={loading}
                className="opening-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Loading...
                  </>
                ) : (
                  "Best Opening Words"
                )}
              </button>
            </div>
          </form>
        </div>
        {error && (
          <div className="error-card">
            {error}
          </div>
        )}
        {/* Next Best Guesses Section */}
        {nextBestGuesses.length > 0 && (
          <div className="suggestions-card">
            <h2 className="suggestions-title">
              {showOpeningWords ? "Best Opening Words" : "Next Best Guesses"}
              <span className="suggestions-count">({nextBestGuesses.length})</span>
            </h2>
            <p className="suggestions-subtitle">
              {showOpeningWords 
                ? "These words maximize information gain for your first guess"
                : "Strategic words that will help narrow down the solution"
              }
            </p>
            <div className="suggestions-grid">
              {nextBestGuesses.map((suggestion, idx) => (
                <div key={idx} className="suggestion-item">
                  <div className="suggestion-word">
                    {suggestion.word.toUpperCase()}
                  </div>
                  <div className="suggestion-details">
                    <div className="suggestion-score">
                      Score: {suggestion.score.toFixed(2)}
                    </div>
                    <div className="suggestion-metrics">
                      {suggestion.information_gain > 0 && (
                        <span className="metric info-gain">
                          Info: {suggestion.information_gain.toFixed(2)}
                        </span>
                      )}
                      <span className="metric strategic">
                        Strategic: {suggestion.strategic_score.toFixed(2)}
                      </span>
                      {suggestion.is_possible_solution && (
                        <span className="metric possible-solution">✓ Possible Answer</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {showOpeningWords && (
              <div className="opening-tip">
                Tip: Try "AROSE" or "AUDIO" — they contain the most common vowels and consonants.
              </div>
            )}
          </div>
        )}

        {/* Solutions Section */}
        <div className="results-card">
          <h2 className="results-title">
            Possible Solutions
            {solutionsCount > 0 && (
              <span className="results-count">({solutionsCount})</span>
            )}
          </h2>
          {solutions.length === 0 && !showOpeningWords ? (
            <div className="no-results">
              <p>Enter your clues above to get solutions and suggestions.</p>
              <p className="no-results-hint">Or use Best Opening Words for optimal starting guesses.</p>
            </div>
          ) : solutions.length > 0 ? (
            <div className="solutions-grid">
              {solutions.map((word, idx) => (
                <div key={idx} className="solution-item">
                  {word.toUpperCase()}
                </div>
              ))}
            </div>
          ) : showOpeningWords ? (
            <div className="no-results">
              <p>Use one of the suggested opening words above to begin.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;