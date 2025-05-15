@echo off
echo Starting Code Editor application...

set APP_PATH=src-tauri\target\release\tauri-codemirror-editor.exe

if not exist %APP_PATH% (
    echo Error: Application not found at %APP_PATH%
    echo Please run build-windows.bat first to build the application.
    exit /b 1
)

echo Launching application...
start "" %APP_PATH%

exit /b 0 