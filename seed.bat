@echo off
setlocal
cd /d "%~dp0"
call mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--app.seed-demo-data=true" -Dspring-boot.run.jvmArguments="-Dspring.main.web-application-type=none"
if errorlevel 1 (
  echo Seed failed. Check MongoDB Atlas configuration and credentials.
  exit /b 1
)
