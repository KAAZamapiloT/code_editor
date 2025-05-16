@echo off
rem GLITCH.CRT_EDITOR build and run script for Windows
rem Usage: build-run.bat [install|build|dev|run]

echo.
echo  ___________.____     __________  _____________________ ______________  ________  ___________________  ________ 
echo  \__    ___/^|    ^|    \______   \/  _____/\_   _____/  ^|  \_   _____/ \______ \ \_   ___ \__    ___/ /  _____/ 
echo    ^|    ^|   ^|    ^|     ^|    ^|  _/   \  ___ ^|    __)_^|  ^|  /^|    __)_   ^|    ^|  \/    \  \/ ^|    ^|   /   \  ___ 
echo    ^|    ^|   ^|    ^|___  ^|    ^|   \    \_\  \^|        \   \_/ ^|        \  ^|    `   \     \___^|    ^|   \    \_\  \
echo    ^|____^|   ^|_______ \ ^|______  /\______  /_______  /\___  /_______  / /_______  /\______  /^|____^|    \______  /
echo                      \/        \/        \/        \/     \/        \/          \/        \/                \/ 
echo.

rem Process command line argument
if "%~1"=="install" goto :install
if "%~1"=="build" goto :build
if "%~1"=="dev" goto :dev
if "%~1"=="run" goto :run
goto :help

:install
echo Installing dependencies...
call npm install
echo Dependencies installed!
goto :end

:build
echo Building application...
rem Run the React build
call npm run build

rem Ensure the build directory exists
if not exist ".\build" (
    echo Build directory not found, creating it...
    mkdir ".\build"
)

rem Copy HTML files from public to build
echo Copying HTML files to build directory...
copy /Y ".\public\*.html" ".\build\"

rem Create electron build
echo Building Electron application...
call npm run electron:build:windows
echo Build completed! Check the 'dist' folder for the executable.
goto :end

:dev
echo Starting in development mode...
call npm run electron:dev
goto :end

:run
echo Running application...
if exist ".\dist" (
    for /f "delims=" %%a in ('dir /b /s ".\dist\*.exe" ^| findstr /v "unins"') do (
        echo Found: %%a
        start "" "%%a"
        goto :end
    )
    echo No executable found in dist folder. Running from source...
    call npm start
) else (
    echo Dist folder not found. Running from source...
    call npm start
)
goto :end

:help
echo Usage: %0 [install^|build^|dev^|run]
echo   install - Install dependencies
echo   build   - Build the application
echo   dev     - Run in development mode
echo   run     - Run the built application

:end
exit /b 0 