@echo off
echo Starting Code Editor build process...

REM Check if Node.js is installed
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed or not in PATH
    exit /b 1
)

echo Installing dependencies...
npm install --legacy-peer-deps
IF %ERRORLEVEL% NEQ 0 (
    echo Error: npm install failed
    exit /b %ERRORLEVEL%
)

echo Building SvelteKit frontend...
npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Frontend build failed
    exit /b %ERRORLEVEL%
)

REM Check if Tauri CLI is installed
where cargo >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Rust is not installed or not in PATH
    echo Please install Rust from https://www.rust-lang.org/tools/install
    exit /b 1
)

echo Building Tauri Windows application...
cd src-tauri
cargo build --release
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Tauri build failed
    exit /b %ERRORLEVEL%
)

echo.
echo Build completed successfully!
echo The application is available at: src-tauri\target\release\tauri-codemirror-editor.exe
echo. 