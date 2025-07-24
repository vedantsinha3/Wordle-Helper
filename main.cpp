#include <iostream>
#include <string>
#include <vector>
#include <cstring>
#include "WordleHelper.cpp"

using namespace std;

int main(int argc, char* argv[]){
    WordleHelper wh;
    
    // Parse command-line arguments
    for (int i = 1; i < argc; ++i) {
        if (strcmp(argv[i], "--green") == 0 && i + 1 < argc) {
            wh.addGreen(argv[++i]);
        } else if (strcmp(argv[i], "--yellow") == 0 && i + 1 < argc) {
            wh.addYellow(argv[++i]);
        } else if (strcmp(argv[i], "--gray") == 0 && i + 1 < argc) {
            wh.addGray(argv[++i]);
        } else {
            cerr << "Unknown or incomplete argument: " << argv[i] << endl;
            return 1;
        }
    }

    vector<string> result = wh.possibleSolutions();
    for(const string& word : result){
        cout << word << endl;
    }
    return 0;
}