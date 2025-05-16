@echo off
echo  ___________.____     __________  _____________________________    ___________ ___________________ 
echo  \__    ___/^|    ^|    \______   \/   _____/\      \__    ___/     \_   _____/ \_   ___ \__    ___/ 
echo    ^|    ^|   ^|    ^|     ^|    ^|  _/\_____  \ /   ^|   \^|    ^|        ^|    __)_  /    \  \/ ^|    ^|   
echo    ^|    ^|   ^|    ^|___  ^|    ^|   \/        /    ^|    ^|    ^|        ^|        \ \     \____^|    ^|   
echo    ^|____^|   ^|_______ \ ^|______  /_______  /\____^|__  /____^|       /_______  / \______  /^|____^|   
echo                      \/        \/        \/         \/                     \/         \/         
echo.
echo =============================== GLITCH.CRT_EDITOR LAUNCHER ===============================
echo.

rem Process command-line arguments
set ONLINE_MODE=true
set MODE_TEXT=online
set MODE_ARG=

:parse
if "%~1"=="" goto endparse
if /i "%~1"=="--offline" (
    set ONLINE_MODE=false
    set MODE_TEXT=offline
    set MODE_ARG=--offline
)
if /i "%~1"=="-o" (
    set ONLINE_MODE=false
    set MODE_TEXT=offline
    set MODE_ARG=--offline
)
shift
goto parse
:endparse

echo Starting GLITCH.CRT_EDITOR in %MODE_TEXT% mode...
echo.

rem Check if app is built
if not exist dist\win-unpacked (
    echo Application not built. Building now...
    call build-windows.bat
)

rem Launch the application in the specified mode
if "%ONLINE_MODE%"=="true" (
    echo Launching application in online mode...
    echo Features available:
    echo  * Full React-based editor with all capabilities
    echo  * Full syntax highlighting and smart autocompletion
    echo  * Terminal with shell access
    echo  * All editor extensions and plugins
) else (
    echo Launching application in offline mode...
    echo Features available:
    echo  * Multicolor syntax highlighting
    echo  * Advanced CRT lens distortion effects
    echo  * Smart code autocompletion
    echo  * Basic code execution capabilities
)

echo.
echo Launching application...
start "" "dist\win-unpacked\GLITCH.CRT_EDITOR.exe" %MODE_ARG%

echo.
echo Application started. You can close this window.
exit /b 0 