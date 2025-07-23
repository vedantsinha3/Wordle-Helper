#include <iostream>
#include <string>
#include "WordleHelper.cpp"


using namespace std;

int main(){

   WordleHelper wh;

   wh.addGreen("__i__");
   wh.addYellow("____e");
   wh.addGray("agl");




   


   












   vector<string> result = wh.possibleSolutions();

   for(string& word : result){
       cout << word << endl; 

   }

return 0;
}