@echo off
rem ============================================================
rem  Hostel & Mess Finder - one-click setup for Windows
rem  Put this file inside the hostel-mess-finder folder
rem  (the folder that contains "tools" and "app"), then double-click it.
rem ============================================================
cd /d "%~dp0"
set PATH=C:\msys64\ucrt64\bin;%PATH%

echo.
echo === 1/5 Checking tools ===
where node >nul 2>nul || (echo Node.js not found. Install the LTS version from nodejs.org, then run this again. & pause & exit /b 1)
where g++ >nul 2>nul || (echo g++ not found. Install MSYS2 and add C:\msys64\ucrt64\bin to PATH, then restart and run this again. & pause & exit /b 1)
if not exist tools\json.hpp (echo json.hpp is missing. Download it from github.com/nlohmann/json/releases and put it in the tools folder. & pause & exit /b 1)
echo Tools OK.

echo.
echo === 2/5 Building the C++ tool ===
pushd tools
g++ data_tool.cpp -o data_tool.exe -std=c++17 || (echo C++ build failed. Send me the error above. & popd & pause & exit /b 1)

echo.
echo === 3/5 Validating CSV data and creating data.json ===
if not exist ..\app\data mkdir ..\app\data
data_tool.exe hostels.csv messes.csv ..\app\data\data.json 18.5204 73.8567 || (echo Problems found in the CSV files. Fix the lines listed above and run again. & popd & pause & exit /b 1)
popd

echo.
echo === 4/5 Creating the Expo app - this can take a few minutes ===
if not exist hostel-mess-finder-app (
  call npx --yes create-expo-app@latest hostel-mess-finder-app --template blank
  if errorlevel 1 (echo Expo app creation failed. Send me the error above. & pause & exit /b 1)
)

echo.
echo === 5/5 Copying app files ===
copy /Y app\App.js hostel-mess-finder-app\App.js
xcopy /E /I /Y app\src hostel-mess-finder-app\src
xcopy /E /I /Y app\data hostel-mess-finder-app\data
xcopy /E /I /Y app\assets\photos hostel-mess-finder-app\assets\photos

echo.
echo === Starting the app. Scan the QR code with Expo Go on your phone ===
echo If the phone cannot connect, close this window and run:  npx expo start --tunnel
cd hostel-mess-finder-app
call npx expo start
pause
