@echo off
setlocal

set "PROJECT_DIR=%~dp0frontend"
set "KILL_PORT_SCRIPT=%~dp0kill-port.bat"
set "WINDOW_TITLE=LabTestBooking Frontend"
set "APP_PORT=3000"

if not exist "%PROJECT_DIR%\package.json" (
  echo ERROR: frontend package.json not found at "%PROJECT_DIR%\package.json"
  echo Please run this script from project root where frontend folder exists.
  exit /b 1
)

if not exist "%KILL_PORT_SCRIPT%" (
  echo ERROR: kill-port.bat not found at "%KILL_PORT_SCRIPT%"
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm is not installed or not available in PATH.
  exit /b 1
)

echo Starting frontend in a new window...
start "%WINDOW_TITLE%" cmd /k "cd /d "%PROJECT_DIR%" && echo Releasing port %APP_PORT%... && call "%KILL_PORT_SCRIPT%" %APP_PORT% && echo Installing dependencies if needed... && npm install && echo Starting frontend... && npm run dev"

echo Frontend launch command sent.
echo Close this window if not needed.

endlocal
