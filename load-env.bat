@echo off
set "ENV_FILE=%~1"
if "%ENV_FILE%"=="" set "ENV_FILE=.env"

if not exist "%ENV_FILE%" (
  echo .env file not found at "%ENV_FILE%". Skipping env load.
  exit /b 0
)

for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
  if not "%%A"=="" if not "%%A:~0,1"=="#" set "%%A=%%B"
)

exit /b 0
