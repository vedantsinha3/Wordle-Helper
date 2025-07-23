## 🧠 WordleHelper

### Overview

**WordleHelper** is a C++ command-line tool designed to help you crack the Wordle puzzle by filtering possible answers based on your green, yellow, and gray letter feedback.

This project loads real Wordle answer lists and allowed guesses from external text files, then eliminates candidates that don’t match your given feedback. The more feedback you feed it, the more precise the solution set becomes.

### Features

* ✅ Supports green (correct position), yellow (wrong position), and gray (not in word) feedback.
* 🔎 Filters based on actual `answers.txt` and `allowed.txt` files from the official Wordle dataset.
* 🛡️ Validates feedback inputs for format and correctness.
* 🧪 Generates a list of all possible remaining answers.

### Requirements

* C++11 or higher

### Compilation

```bash
g++ -std=c++11 -o wordle WordleHelper.cpp
```

> Make sure `answers.txt` and `allowed.txt` are in the same directory as the executable.

### Example Usage

```cpp
WordleHelper helper;
helper.addGreen("_p__e");    // e.g., 'p' in position 2, 'e' in position 5
helper.addYellow("a___r");   // 'a' and 'r' are in the word but wrong positions
helper.addGray("cnd");       // letters definitely not in the word

std::vector<std::string> results = helper.possibleSolutions();
for (const std::string& word : results) {
    std::cout << word << std::endl;
}
```

### Files

* `WordleHelper.h`: Header file and implementation of the helper class.
* `answers.txt`: Official list of Wordle answer words.
* `allowed.txt`: Official list of allowed guesses.

---

## 📝 GitHub Description

> 🧠 C++ Wordle-solving assistant that narrows down answers using green, yellow, and gray clues. Reads official Wordle answer + guess lists and outputs all remaining candidates. CLI-ready.
