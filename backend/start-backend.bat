@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "WINDOW_TITLE=LabTestBooking Backend"

echo Starting backend in a new window...
start "%WINDOW_TITLE%" cmd /k "cd /d "%PROJECT_DIR%" && mvn clean compile spring-boot:run"

echo Backend launch command sent.
echo Close this window if not needed.

endlocal
