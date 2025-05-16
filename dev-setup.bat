@echo off
setlocal enabledelayedexpansion

if "%1"=="" goto :help
if "%1"=="help" goto :help
if "%1"=="install" goto :install
if "%1"=="dev" goto :dev
if "%1"=="build" goto :build
if "%1"=="run" goto :run
if "%1"=="clean" goto :clean
goto :help

:help
echo Code Editor Development Helper
echo.
echo Usage: dev-setup.bat [command]
echo.
echo Commands:
echo   install    - Install dependencies
echo   dev        - Run in development mode
echo   build      - Build for Windows
echo   run        - Run the built application
echo   clean      - Clean build artifacts
echo   help       - Show this help message
echo.
goto :end

:install
echo Installing dependencies...
call npm install
echo Dependencies installed successfully!
goto :end

:dev
echo Starting development mode...
call run-dev.bat
goto :end

:build
echo Building application for Windows...
call build-windows.bat
goto :end

:run
echo Running the application...
call run-app.bat
goto :end

:clean
echo Cleaning build artifacts...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
echo Clean completed!
goto :end

:end
exit /b 0 