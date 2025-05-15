@echo off
echo Starting Code Editor in development mode...

REM Check if Node.js is installed
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Check if dependencies are installed
if not exist node_modules (
    echo Installing dependencies...
    npm install --legacy-peer-deps
    IF %ERRORLEVEL% NEQ 0 (
        echo Error: npm install failed
        exit /b %ERRORLEVEL%
    )
)

echo Starting development server...
REM Check if Tauri is requested
if "%1"=="tauri" (
    echo Running with Tauri native shell...
    npm run tauri:dev
) else (
    echo Running in web browser mode...
    npm run dev
)

exit /b 0 