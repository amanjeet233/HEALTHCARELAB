@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "PROJECT_DIR=%ROOT_DIR%backend"
set "KILL_PORT_SCRIPT=%ROOT_DIR%kill-port.bat"
set "LOAD_ENV_SCRIPT=%ROOT_DIR%load-env.bat"
set "ENV_FILE=%ROOT_DIR%.env"
set "DB_URL=jdbc:mysql://localhost:3306/labtestbooking"
set "DB_USER=root"
set "DB_PASS=Amanjeet@4321."
set "MIGRATION_PATH=filesystem:src/main/resources/db/migration"
set "APP_PORT=8080"
set "SPRING_BOOT_JVM_ARGS=-Dspring.datasource.url=%DB_URL% -Dspring.datasource.username=%DB_USER% -Dspring.datasource.password=%DB_PASS%"
set "BACKEND_FORCE_CLEAN=%BACKEND_FORCE_CLEAN%"
if "%BACKEND_FORCE_CLEAN%"=="" set "BACKEND_FORCE_CLEAN=false"

if not exist "%PROJECT_DIR%\pom.xml" (
  echo ERROR: backend pom.xml not found at "%PROJECT_DIR%\pom.xml"
  exit /b 1
)

if not exist "%KILL_PORT_SCRIPT%" (
  echo ERROR: kill-port.bat not found at "%KILL_PORT_SCRIPT%"
  exit /b 1
)

if not exist "%LOAD_ENV_SCRIPT%" (
  echo ERROR: load-env.bat not found at "%LOAD_ENV_SCRIPT%"
  exit /b 1
)

cd /d "%ROOT_DIR%"
echo Loading environment from .env...
call "%LOAD_ENV_SCRIPT%" "%ENV_FILE%"

cd /d "%PROJECT_DIR%"
echo Releasing port %APP_PORT%...
call "%KILL_PORT_SCRIPT%" %APP_PORT%

echo Terminating stale backend Maven/Java processes...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$all = @(Get-CimInstance Win32_Process); $procs = @($all.Where({ ($_.Name -in @('java.exe','cmd.exe')) -and $_.CommandLine -like '*HEALTHCARELAB\\backend*' -and $_.ProcessId -ne $PID })); if ($procs.Count -eq 0) { Write-Host 'No stale backend processes found.' } else { foreach ($p in $procs) { Write-Host ('Killing PID ' + $p.ProcessId + ' (' + $p.Name + ')'); Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue } }"
if errorlevel 1 (
  echo WARNING: stale process cleanup encountered an issue. Continuing...
)

echo Running Flyway repair...
call mvn org.flywaydb:flyway-maven-plugin:9.22.3:repair "-Dflyway.url=%DB_URL%" "-Dflyway.user=%DB_USER%" "-Dflyway.password=%DB_PASS%" "-Dflyway.locations=%MIGRATION_PATH%"
if errorlevel 1 (
  echo Flyway repair failed.
  exit /b 1
)

echo Repair complete. Starting backend...
if /I "%BACKEND_FORCE_CLEAN%"=="true" (
  echo BACKEND_FORCE_CLEAN=true, running clean before start...
  call mvn clean "-DskipTests"
  if errorlevel 1 (
    echo WARNING: Maven clean failed due to locked files. Continuing without clean...
  )
)
call mvn spring-boot:run "-Dspring-boot.run.jvmArguments=%SPRING_BOOT_JVM_ARGS%"

endlocal
exit /b %errorlevel%
