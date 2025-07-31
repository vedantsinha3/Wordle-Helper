# 🎯 AI-Powered Wordle Helper

An intelligent Wordle-solving assistant featuring **AI-driven word suggestions**, **information theory analysis**, and a sleek React frontend. The system uses advanced algorithms to provide strategic recommendations that maximize your chances of solving in the fewest guesses.

## 📸 Screenshot

Here's how the enhanced Wordle Helper interface looks:

<img width="1680" height="845" alt="image" src="https://github.com/user-attachments/assets/9423cdd9-4448-413b-b13c-e327a8da89a2" />


## 🧠 Advanced Features

### 🚀 **AI-Powered Recommendations**
- **Information Gain Analysis**: Uses Shannon entropy to calculate optimal guesses
- **Strategic Scoring**: Letter frequency analysis from 2,315 Wordle answers
- **Next Best Word Suggestions**: Top 5 strategic recommendations with detailed scoring
- **Best Opening Words**: Pre-calculated optimal starting guesses
- **Dynamic Strategy**: Adapts recommendations based on remaining solutions

### 🎮 **Smart Game Logic**
- **Accurate clue parsing** (green/yellow/gray) with complex constraint handling
- **Intelligent word filtering** that eliminates impossible solutions
- **Previous guess tracking** to avoid duplicate suggestions
- **Multi-layered scoring system** combining information theory + letter statistics

### 🎨 **Professional Interface**
- **Interactive Wordle-style grid** with click-to-cycle colors
- **Real-time suggestions** with detailed scoring breakdown
- **Responsive design** optimized for desktop and mobile
- **Professional styling** with smooth animations and hover effects

## 🖥️ Frontend

Built with **React** featuring:

- **Interactive 5×N grid** that mimics official Wordle interface
- **Dynamic suggestion cards** showing word scores and metrics
- **Professional button styling** with gradient backgrounds
- **Real-time API communication** with the Python backend
- **Responsive design** that works on all screen sizes

### Key Components:
- **Grid Input System**: Click cells to cycle colors, type letters
- **Suggestion Display**: Shows information gain, strategic scores, and solution probability
- **Opening Words**: Get optimal starting words with one click
- **Error Handling**: User-friendly error messages and loading states

## ⚙️ Backend Architecture

### 🐍 **Python Flask API** (Primary)
The main backend featuring sophisticated AI algorithms:

```python
# Key endpoints:
POST /solve          # Get solutions + next best guesses  
GET  /best_opening   # Optimal opening words
```

**Core AI Features:**
- **Information Gain Calculation**: Uses entropy to measure guess effectiveness
- **Strategic Word Scoring**: Letter frequency analysis + uniqueness bonuses
- **Performance Optimization**: Adaptive candidate selection based on game state
- **Pattern Recognition**: Simulates all possible Wordle color patterns

### ⚡ **C++ Engine** (Fallback)
High-performance word filtering for validation:

- **Green clue enforcement** (exact position matching)
- **Yellow clue logic** (letter present, wrong position)
- **Gray clue handling** with complex per-position constraints
- **Double-letter edge cases** and frequency analysis

#### Compile Instructions

```bash
g++ -std=c++17 -g -o app WordleHelper.cpp main.cpp
```

#### Run

```bash
./app --green "a____" --yellow "_r___" --gray "stne"
```

## 🚀 Quick Start

### Backend Setup
```bash
# Start the Python backend
python3 backend.py
```

### Frontend Setup
```bash
# Install dependencies and start React app
cd frontend
npm install
npm start
```

### Usage
1. **Click cells** to cycle through colors (blank → gray → yellow → green)
2. **Type letters** in each cell for your guesses
3. **Click "Find Solutions"** to get possible answers + strategic suggestions
4. **Use "Best Opening Words"** for optimal starting guesses

## 🧮 AI Scoring System

The recommendation engine uses a multi-layered approach:

| Component | Weight | Description |
|-----------|--------|-------------|
| **Information Gain** | ×2.0 | Shannon entropy calculation (elimination power) |
| **Strategic Score** | ×1.0 | Letter frequency + uniqueness analysis |
| **Solution Bonus** | +1.0 | Boost if word could be the actual answer |

**Example Calculation:**
```
Word: "STERN"
- Information Gain: 3.2 bits → 6.4 points
- Strategic Score: 2.1 points (high-frequency letters)
- Solution Bonus: 1.0 points (possible answer)
- Final Score: 9.5 points
```

## 📁 Project Structure

```
Wordle Bot/
├── frontend/                 # React application
│   ├── src/
│   │   ├── App.js           # Main component with grid + suggestions
│   │   ├── App.css          # Professional styling
│   │   └── index.js         # React entry point
│   └── package.json         # Dependencies
├── backend.py               # Python Flask API with AI algorithms
├── WordleHelper.cpp         # C++ word filtering engine
├── main.cpp                 # C++ CLI interface
├── answers.txt              # Official 2,315 Wordle answers
├── allowed.txt              # All 10,657 valid guesses
└── README.md               # This file
```

## 🎯 Algorithm Details

### Information Theory Approach
- **Entropy Calculation**: Measures uncertainty reduction
- **Pattern Simulation**: Tests all possible color outcomes
- **Optimal Guess Selection**: Maximizes expected information gain

### Strategic Analysis
- **Letter Frequency Mapping**: Based on actual Wordle answer distribution
- **Uniqueness Scoring**: Rewards words with 5 unique letters
- **Repetition Penalties**: Avoids words with duplicate letters

### Performance Optimizations
- **Adaptive Candidate Selection**: Different strategies for early/mid/end game
- **Cached Calculations**: Pre-computed opening word rankings
- **Lazy Evaluation**: Full entropy calculation only when needed

## 📝 License

MIT License
