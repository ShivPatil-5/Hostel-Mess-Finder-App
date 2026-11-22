# Offline Hostel & Mess Finder

hostel-mess-finder/
  tools/   C++ tool + CSV files (data from Google Sheets)  ->  makes data.json
  app/     Expo (React Native) app files  ->  copy into your Expo project

Quick steps
1. tools: put json.hpp next to data_tool.cpp, then
   g++ data_tool.cpp -o data_tool -std=c++17
   ./data_tool hostels.csv messes.csv ../app/data/data.json <college_lat> <college_lon>
2. npx create-expo-app@latest hostel-mess-finder-app --template blank
3. Copy app/App.js, app/src, app/data, app/assets/photos into that project.
4. npx expo start  -> scan the QR code with Expo Go on your Android phone.
