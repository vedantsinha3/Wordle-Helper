# Wordle Helper

A Wordle assistant that suggests guesses based on information theory (Shannon entropy) and letter frequency analysis. Uses the official 2,315 Wordle answers and 10,657 valid guesses.

<img width="1710" height="891" alt="image" src="https://github.com/user-attachments/assets/748f3e3f-503c-46ed-953e-84d194cd0bab" />


## Quick Start

**Backend**
```bash
python3 backend.py
```

**Frontend**
```bash
cd frontend
npm install
npm start
```

**Usage:** Click cells to cycle colors (blank → gray → yellow → green), type your guesses, then hit "Find Solutions" for possible answers and suggested next guesses. Use "Best Opening Words" for good first guesses.

## How it works

The solver filters the answer list using green (correct position), yellow (present, wrong position), and gray (absent) clues. It then ranks remaining candidates and suggestions by:
- Information gain (entropy-based, how much each guess narrows the space)
- Strategic score (letter frequency from the answer set, uniqueness bonus)
- Solution bonus (extra weight if the word could be the answer)

**API**
- `POST /solve` — returns solutions and next-best guesses
- `GET /best_opening` — returns optimal opening words

## C++ CLI (optional)

The C++ binary does the same filtering for command-line use:

```bash
g++ -std=c++17 -g -o app WordleHelper.cpp main.cpp
./app --green "a____" --yellow "_r___" --gray "stne"
```

## Project structure

```
├── frontend/           # React app
├── backend.py          # Flask API
├── WordleHelper.cpp    # C++ filter engine
├── main.cpp            # C++ CLI
├── answers.txt         # 2,315 Wordle answers
├── allowed.txt         # 10,657 valid guesses
└── req.txt             # Python dependencies
```

## License

MIT
