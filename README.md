# Wordle Helper

A Wordle-solving assistant that uses a React-based frontend and a C++ backend to filter valid guesses based on green, yellow, and gray clues. The app mimics Wordle’s logic to eliminate impossible words and suggest likely solutions.

## 📸 Screenshot

Here's how the Wordle Helper interface looks:

![Wordle Helper Screenshot](./assets/screenshot.png)
<img width="1680" height="850" alt="image" src="https://github.com/user-attachments/assets/a49ae3a5-cf55-428f-b0dc-c4ce1eafd3f8" />



## 🧠 Features

- Accurate clue parsing (green/yellow/gray)
- Smart elimination of invalid words
- React-based UI for smooth interaction
- C++ backend handles fast logic and filtering
- Built using official Wordle answer and guess lists

## 🖥️ Frontend

Built with [React](https://reactjs.org/):

- Users input guesses and receive visual feedback
- Clean UI mimics Wordle's color-coded logic
- Communicates with backend via local API or file I/O

## ⚙️ Backend (C++)

Handles:
- Green clue enforcement (exact position)
- Yellow clue enforcement (must be present, wrong position)
- Gray clue handling with per-position logic
- Letter frequency and double-letter logic

### Compile Instructions

```bash
g++ -std=c++17 -g -o app WordleHelper.cpp main.cpp
````

### Run

```bash
./app
```

> Alternatively, connect to frontend via API or integrate with Electron for desktop packaging.

## 📁 Project Structure

```
/frontend         # React frontend
/backend          # C++ logic engine
answers.txt       # Official Wordle answer list
allowed.txt       # Allowed guesses list
```

## 📝 License

MIT License
