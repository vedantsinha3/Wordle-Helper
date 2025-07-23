#ifndef WORDLE_HELPER_H
#define WORDLE_HELPER_H

#include <stdexcept>
#include <string>
#include <fstream>
#include <iostream>
#include <algorithm>
#include <vector>
#include <map>

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

    // Iterate through the green feedback
    for (const std::string& currGreen : green) {
        result.erase(std::remove_if(result.begin(), result.end(), [&](const std::string& word) {
            return !satisfyGreen(word, currGreen);
        }), result.end());
    }

    // Iterate through the yellow feedback
    for (const std::string& currYellow : yellow) {
        result.erase(std::remove_if(result.begin(), result.end(), [&](const std::string& word) {
            for (int i = 0; i < 5; i++) {
                if (currYellow[i] != '_' && !contains(word, currYellow[i])) {
                    return true;
                }
            }
            return false;
        }), result.end());
    }

    // Iterate through the gray feedback
    for (const std::string& currGray : gray) {
        result.erase(std::remove_if(result.begin(), result.end(), [&](const std::string& word) {
            return std::any_of(currGray.begin(), currGray.end(), [&](char c) {
                return contains(word, c);
            });
        }), result.end());
    }

    return result;

}
};

#endif