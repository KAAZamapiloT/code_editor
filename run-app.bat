@echo off
echo Starting Code Editor...

rem Check if app is built
if not exist dist\win-unpacked (
    echo Application not built. Building now...
    call build-windows.bat
)

echo Launching application...
start "" "dist\win-unpacked\Code Editor.exe"

exit /b 0 