@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js not found. Install Node.js LTS from https://nodejs.org
  pause
  exit /b 1
)
echo Starting MEMENTO Studio 3.1 at http://127.0.0.1:4173
npm run start
pause
