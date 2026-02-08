from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import subprocess
import math
from collections import Counter, defaultdict
from typing import List, Dict, Tuple, Set
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class WordleSolver:
    def __init__(self):
        self.answers = self._load_words('answers.txt')
        self.allowed = self._load_words('allowed.txt')
        self.all_words = set(self.answers + self.allowed)
        self.letter_frequencies = self._calculate_letter_frequencies()
        
    def _load_words(self, filename: str) -> List[str]:
        """Load words from file"""
        try:
            with open(filename, 'r') as f:
                return [line.strip().lower() for line in f if line.strip()]
        except FileNotFoundError:
            print(f"Warning: {filename} not found, using empty list")
            return []
    
    def _calculate_letter_frequencies(self) -> Dict[str, float]:
        """Calculate letter frequencies in answer set for scoring"""
        letter_count = Counter()
        for word in self.answers:
            for letter in set(word):  # Count each letter once per word
                letter_count[letter] += 1
        
        total_words = len(self.answers)
        return {letter: count / total_words for letter, count in letter_count.items()}
    
    def _filter_solutions(self, green: List[str], yellow: List[str], gray: List[str]) -> List[str]:
        """Filter possible solutions based on constraints"""
        result = self.answers.copy()
        
        # Build green pattern
        green_pattern = ['_'] * 5
        for curr_green in green:
            if len(curr_green) == 5:
                for i in range(5):
                    if curr_green[i] != '_':
                        green_pattern[i] = curr_green[i]
        
        # Handle yellow clues
        yellow_positions = defaultdict(set)
        must_contain = set()
        for curr_yellow in yellow:
            if len(curr_yellow) == 5:
                for i in range(5):
                    if curr_yellow[i] != '_':
                        must_contain.add(curr_yellow[i])
                        yellow_positions[curr_yellow[i]].add(i)
        
        # Handle gray clues
        global_gray_letters = set()
        gray_positions = defaultdict(set)
        
        for curr_gray in gray:
            for char in curr_gray:
                if 'a' <= char <= 'z':
                    # Check if letter appears in green or yellow
                    is_green_or_yellow = False
                    for g in green:
                        if char in g:
                            is_green_or_yellow = True
                            break
                    if not is_green_or_yellow:
                        for y in yellow:
                            if char in y:
                                is_green_or_yellow = True
                                break
                    
                    if not is_green_or_yellow:
                        global_gray_letters.add(char)
        
        # Filter words
        filtered_result = []
        for word in result:
            # Check green pattern
            valid = True
            for i in range(5):
                if green_pattern[i] != '_' and word[i] != green_pattern[i]:
                    valid = False
                    break
            
            if not valid:
                continue
            
            # Check yellow constraints
            for char, banned_positions in yellow_positions.items():
                if char not in word:
                    valid = False
                    break
                for pos in banned_positions:
                    if word[pos] == char:
                        valid = False
                        break
                if not valid:
                    break
            
            if not valid:
                continue
            
            # Check must contain letters
            for char in must_contain:
                if char not in word:
                    valid = False
                    break
            
            if not valid:
                continue
            
            # Check global gray letters
            for char in global_gray_letters:
                if char in word:
                    valid = False
                    break
            
            if valid:
                filtered_result.append(word)
        
        return filtered_result
    
    def _calculate_word_score(self, word: str, possible_solutions: List[str]) -> float:
        """Calculate a word's strategic value based on letter frequency and uniqueness"""
        unique_letters = set(word)
        
        # Score based on letter frequency in remaining solutions
        frequency_score = sum(self.letter_frequencies.get(letter, 0) for letter in unique_letters)
        
        # Bonus for having more unique letters
        uniqueness_bonus = len(unique_letters) / 5.0
        
        # Penalty if word has repeated letters (less information gain)
        repetition_penalty = (5 - len(unique_letters)) * 0.1
        
        return frequency_score + uniqueness_bonus - repetition_penalty
    
    def _calculate_information_gain(self, guess: str, possible_solutions: List[str]) -> float:
        """Calculate expected information gain for a guess using entropy"""
        if not possible_solutions:
            return 0
        
        # Group solutions by the pattern they would produce with this guess
        pattern_groups = defaultdict(list)
        
        for solution in possible_solutions:
            pattern = self._get_pattern(guess, solution)
            pattern_groups[pattern].append(solution)
        
        # Calculate entropy
        total_solutions = len(possible_solutions)
        entropy = 0
        
        for pattern, solutions in pattern_groups.items():
            probability = len(solutions) / total_solutions
            if probability > 0:
                entropy -= probability * math.log2(probability)
        
        return entropy
    
    def _get_pattern(self, guess: str, solution: str) -> str:
        """Get the color pattern (G=green, Y=yellow, B=black/gray) for a guess against a solution"""
        pattern = ['B'] * 5
        solution_chars = list(solution)
        
        # First pass: mark green letters
        for i in range(5):
            if guess[i] == solution[i]:
                pattern[i] = 'G'
                solution_chars[i] = None  # Mark as used
        
        # Second pass: mark yellow letters
        for i in range(5):
            if pattern[i] == 'B':  # Not already green
                if guess[i] in solution_chars:
                    pattern[i] = 'Y'
                    solution_chars[solution_chars.index(guess[i])] = None
        
        return ''.join(pattern)
    
    def get_next_best_guesses(self, green: List[str], yellow: List[str], gray: List[str], 
                            previous_guesses: List[str] = None, num_suggestions: int = 5) -> List[Dict]:
        """Get the best next guesses based on information gain and strategic value"""
        possible_solutions = self._filter_solutions(green, yellow, gray)
        previous_guesses = previous_guesses or []
        previous_guesses_set = set(previous_guesses)
        
        # Performance optimization: limit candidates based on game state
        if len(possible_solutions) <= 3:
            # Very few solutions left, suggest from remaining solutions
            candidates = [word for word in possible_solutions if word not in previous_guesses_set]
        elif len(possible_solutions) <= 20:
            # Use answers + top allowed words for performance
            candidates = [word for word in (self.answers + list(self.allowed)[:1000]) 
                         if word not in previous_guesses_set]
        else:
            # Early game: use a curated set of high-value words
            if not previous_guesses:
                # Hardcoded best opening words for performance
                best_openers = ['arose', 'audio', 'adieu', 'ouija', 'raise', 'raile', 'soare', 'ratio', 'areic', 'alert']
                candidates = [word for word in best_openers if word in self.all_words]
            else:
                # Use answers + subset of allowed words
                candidates = [word for word in (self.answers + list(self.allowed)[:2000]) 
                             if word not in previous_guesses_set]
        
        # Limit candidates for performance
        if len(candidates) > 3000:
            candidates = candidates[:3000]
        
        # Score each candidate
        word_scores = []
        for word in candidates:
            # Calculate information gain (only for reasonable number of solutions)
            if len(possible_solutions) <= 100:
                info_gain = self._calculate_information_gain(word, possible_solutions)
            else:
                # Use strategic score only for performance when many solutions remain
                info_gain = 0
            
            # Calculate strategic score
            strategic_score = self._calculate_word_score(word, possible_solutions)
            
            # Boost score if word is a possible solution
            solution_bonus = 1.0 if word in possible_solutions else 0.0
            
            # Combined score
            total_score = info_gain * 2 + strategic_score + solution_bonus
            
            word_scores.append({
                'word': word,
                'score': total_score,
                'information_gain': info_gain,
                'strategic_score': strategic_score,
                'is_possible_solution': word in possible_solutions
            })
        
        # Sort by score and return top suggestions
        word_scores.sort(key=lambda x: x['score'], reverse=True)
        return word_scores[:num_suggestions]

# Global solver instance
solver = WordleSolver()

@app.route('/solve', methods=['POST'])
def solve():
    data = request.get_json()
    green = data.get('green', [])  # list of strings
    yellow = data.get('yellow', [])  # list of strings
    gray = data.get('gray', [])  # list of strings
    previous_guesses = data.get('previous_guesses', [])  # list of previously guessed words
    
    try:
        # Get possible solutions using the Python implementation
        solutions = solver._filter_solutions(green, yellow, gray)
        
        # Get next best guesses
        next_best = solver.get_next_best_guesses(green, yellow, gray, previous_guesses)
        
        # Also get C++ results for comparison (fallback)
        cpp_solutions = []
        try:
            cmd = ['./app']
            for g in green:
                cmd += ['--green', g]
            for y in yellow:
                cmd += ['--yellow', y]
            for gr in gray:
                cmd += ['--gray', gr]
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            cpp_solutions = result.stdout.strip().split('\n') if result.stdout.strip() else []
        except (subprocess.CalledProcessError, FileNotFoundError, OSError):
            pass  # Use Python implementation; C++ binary may not exist or be wrong architecture
        
        return jsonify({
            'solutions': solutions,
            'solutions_count': len(solutions),
            'next_best_guesses': next_best,
            'cpp_solutions': cpp_solutions,  # For debugging/comparison
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/best_opening', methods=['GET'])
def best_opening():
    """Get the best opening words for Wordle"""
    try:
        # Calculate best opening words (no constraints)
        opening_words = solver.get_next_best_guesses([], [], [], num_suggestions=10)
        
        return jsonify({
            'best_opening_words': opening_words,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=False, host='0.0.0.0', port=port)