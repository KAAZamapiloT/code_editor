@echo off
echo  ___________.____     __________  _____________________________    ___________ ___________________ 
echo  \__    ___/^|    ^|    \______   \/   _____/\      \__    ___/     \_   _____/ \_   ___ \__    ___/ 
echo    ^|    ^|   ^|    ^|     ^|    ^|  _/\_____  \ /   ^|   \^|    ^|        ^|    __)_  /    \  \/ ^|    ^|   
echo    ^|    ^|   ^|    ^|___  ^|    ^|   \/        /    ^|    ^|    ^|        ^|        \ \     \____^|    ^|   
echo    ^|____^|   ^|_______ \ ^|______  /_______  /\____^|__  /____^|       /_______  / \______  /^|____^|   
echo                      \/        \/        \/         \/                     \/         \/         
echo.
echo ================================ GLITCH.CRT_EDITOR OFFLINE ==============================
echo.

echo Starting GLITCH.CRT_EDITOR in offline mode...
echo.

rem Check if app is built
if not exist dist\win-unpacked (
    echo Application not built. Building now...
    call build-windows.bat
)

echo.
echo Features available in offline mode:
echo  * Advanced multicolor syntax highlighting
echo  * Multiple CRT-style themes with lens distortion effects
echo  * File tree navigation panel
echo  * Vim mode support
echo  * Code execution capabilities
echo  * Copy and paste functionality
echo  * Terminal with basic commands
echo.

echo Launching application...
start "" "dist\win-unpacked\GLITCH.CRT_EDITOR.exe" --offline

echo.
echo Application started. You can close this window.
exit /b 0 