#ifndef WORDLE_HELPER_H
#define WORDLE_HELPER_H

#include <stdexcept>
#include <string>
#include <fstream>
#include <iostream>
#include <algorithm>
#include <vector>
#include <map>
#include <set>

class WordleHelper{
 
    std::vector<std::string> allowed;
    std::vector<std::string> answers;

    std::vector<std::string> green;
    std::vector<std::string> yellow;
    std::vector<std::string> gray;


    bool contains(std::string word, char c){
        for (int i = 0; i < word.length(); i++){
            if (word[i] == c){
                return true;
            }
        }

        return false;
    }

    bool satisfyGreen(std::string word, std::string currGreen){
        for (int i=0; i <5; i++){
            if(currGreen[i]!= '_'){
                if(word[i] != currGreen[i]){
                    return false;
                }


            }
        }
        return true;
    }

public:
    WordleHelper(){
        std::string answersFile = "answers.txt";
        std::string allowedFile = "allowed.txt";

        std::fstream newfile;

        newfile.open(answersFile, std::ios::in);
        if (newfile.is_open()){
            std::string tp;
            
            while(getline(newfile, tp)){
                answers.push_back(tp);
            }
            newfile.close();
        }
        else {
            throw std::logic_error("Cant read file " + answersFile + ".");
        }

        newfile.open(allowedFile, std::ios::in);
        if (newfile.is_open()){
            std::string tp;
            
            while(getline(newfile, tp)){
                allowed.push_back(tp);
            }
            newfile.close();
        }
        else {
            throw std::logic_error("Cant read file " + allowedFile + ".");
        }
    }

    void addGreen(std::string feedback){
        if (feedback.size() != 5){
            throw std::logic_error("Green feedback must be exactly 5 characters");
        }
        if (std::any_of(feedback.begin(), feedback.end(), [](char c){
            return c != '_' && (c < 'a' || c > 'z');
        })){
            throw std::logic_error("Green feedback must contain only lowercase letters or underscores");
        }

        green.push_back(feedback);
    }

    void addYellow(std::string feedback){
        if (feedback.size() != 5){
            throw std::logic_error("Yellow feedback must be exactly 5 characters");
        }
        if (std::any_of(feedback.begin(), feedback.end(), [](char c){
            return c != '_' && (c < 'a' || c > 'z');
        })){
            throw std::logic_error("Yellow feedback must contain only lowercase letters or underscores");
        }

        yellow.push_back(feedback);
    }

    void addGray(std::string feedback){
        if (std::any_of(feedback.begin(), feedback.end(), [](char c){
            return c < 'a' && c > 'z';
        })){
            throw std::logic_error("Gray feedback must contain only lowercase letters");
        }

        gray.push_back(feedback);
    }

    std::vector<std::string> possibleSolutions() {
        std::vector<std::string> result = answers;
    
        std::string greenPattern = "_____"; // green letters in their positions
        std::map<char, std::set<int>> yellowPositions; // letter -> positions it cannot be in
        std::set<char> mustContain; // all yellow letters
        std::set<char> globalGrayLetters; // gray letters that never appear green/yellow
        std::map<char, std::set<int>> grayPositions; // letters banned from specific positions
    
        // Build green pattern
        for (const std::string& currGreen : green) {
            for (int i = 0; i < 5; ++i) {
                if (currGreen[i] != '_') {
                    greenPattern[i] = currGreen[i];
                }
            }
        }
    
        // Handle yellow clues
        for (const std::string& currYellow : yellow) {
            for (int i = 0; i < 5; ++i) {
                if (currYellow[i] != '_') {
                    mustContain.insert(currYellow[i]);
                    yellowPositions[currYellow[i]].insert(i); // cannot be in this position
                }
            }
        }
    
        // Handle gray clues
        for (const std::string& currGray : gray) {
            for (int i = 0; i < 5; ++i) {
                char c = currGray[i];
                if (c >= 'a' && c <= 'z') {
                    // If letter appears nowhere in green or yellow, ban it entirely
                    bool isGreenOrYellow = false;
                    for (const std::string& g : green)
                        if (g.find(c) != std::string::npos) isGreenOrYellow = true;
                    for (const std::string& y : yellow)
                        if (y.find(c) != std::string::npos) isGreenOrYellow = true;
    
                    if (isGreenOrYellow) {
                        grayPositions[c].insert(i); // only ban it from this position
                    } else {
                        globalGrayLetters.insert(c); // ban it completely
                    }
                }
            }
        }
    
        // Start filtering
        result.erase(std::remove_if(result.begin(), result.end(), [&](const std::string& word) {
            // Check green pattern
            for (int i = 0; i < 5; ++i) {
                if (greenPattern[i] != '_' && word[i] != greenPattern[i]) {
                    return true;
                }
            }
    
            // Check yellow constraints
            for (const auto& [ch, bannedPos] : yellowPositions) {
                if (word.find(ch) == std::string::npos) return true; // must contain yellow letter
                if (bannedPos.count(word.find(ch)) > 0) return true; // letter is in a banned position
                for (int pos : bannedPos) {
                    if (word[pos] == ch) return true;
                }
            }
    
            // Check gray letters
            for (char c : globalGrayLetters) {
                if (word.find(c) != std::string::npos) return true;
            }
    
            // Check position-specific gray bans
            for (const auto& [ch, positions] : grayPositions) {
                for (int pos : positions) {
                    if (word[pos] == ch) return true;
                }
            }
    
            // Check mustContain letters are present
            for (char c : mustContain) {
                if (word.find(c) == std::string::npos) return true;
            }
    
            return false;
        }), result.end());
    
        return result;
    }
    
};

#endif