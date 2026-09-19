@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed. Please install Node.js 18 or newer first.
  pause
  exit /b 1
)

start "Mid-autumn preview" /b node server.mjs
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:5173/
echo Mid-autumn preview is running at http://127.0.0.1:5173/
echo Close this window to stop using the launcher. The server process may need to be stopped separately.
pause
