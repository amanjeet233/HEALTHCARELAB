@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "PROJECT_DIR=%~dp0backend"
set "KILL_PORT_SCRIPT=%~dp0kill-port.bat"
set "WINDOW_TITLE=LabTestBooking Backend"
set "DB_URL=jdbc:mysql://localhost:3306/labtestbooking"
set "DB_USER=root"
set "DB_PASS=Amanjeet@4321."
set "MIGRATION_PATH=filesystem:src/main/resources/db/migration"
set "APP_PORT=8080"
set "SPRING_BOOT_JVM_ARGS=-Dspring.devtools.restart.enabled=false -Dspring.datasource.url=%DB_URL% -Dspring.datasource.username=%DB_USER% -Dspring.datasource.password=%DB_PASS%"

if not exist "%PROJECT_DIR%\pom.xml" (
  echo ERROR: backend pom.xml not found at "%PROJECT_DIR%\pom.xml"
  echo Please run this script from project root where backend folder exists.
  exit /b 1
)

if not exist "%KILL_PORT_SCRIPT%" (
  echo ERROR: kill-port.bat not found at "%KILL_PORT_SCRIPT%"
  exit /b 1
)

echo Starting backend in a new window...
start "%WINDOW_TITLE%" cmd /k "cd /d "%PROJECT_DIR%" && echo Releasing port %APP_PORT%... && call "%KILL_PORT_SCRIPT%" %APP_PORT% && echo Running Flyway repair... && mvn org.flywaydb:flyway-maven-plugin:9.22.3:repair "-Dflyway.url=%DB_URL%" "-Dflyway.user=%DB_USER%" "-Dflyway.password=%DB_PASS%" "-Dflyway.locations=%MIGRATION_PATH%" && echo Repair complete. Starting backend... && mvn clean compile spring-boot:run "-Dspring-boot.run.jvmArguments=%SPRING_BOOT_JVM_ARGS%""

echo Backend launch command sent.
echo Close this window if not needed.

endlocal
