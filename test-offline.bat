@echo off
rem Test script for offline functionality
rem Tests the offline fallback mechanism in the GLITCH.CRT_EDITOR

echo.
echo  ___________.____     __________  _____________________________    ___________ ___________________  ________ 
echo  \__    ___/^|    ^|    \______   \/   _____/\      \__    ___/     \_   _____/ \_   ___ \__    ___/ /  _____/ 
echo    ^|    ^|   ^|    ^|     ^|    ^|  _/\_____  \ /   ^|   \^|    ^|        ^|    __)_  /    \  \/ ^|    ^|   /   \  ___ 
echo    ^|    ^|   ^|    ^|___  ^|    ^|   \/        /    ^|    ^|    ^|        ^|        \ \     \____^|    ^|   \    \_\  \
echo    ^|____^|   ^|_______ \ ^|______  /_______  /\____^|__  /____^|       /_______  / \______  /^|____^|    \______  /
echo                      \/        \/        \/         \/                     \/         \/                 \/ 
echo.

rem Check if build directory exists
if not exist ".\build" (
    echo Build directory does not exist. Please run build-run.bat build first.
    exit /b 1
)

rem Check if standalone.html exists in build
if not exist ".\build\standalone.html" (
    echo standalone.html not found in build directory.
    echo Copying from public directory...
    
    if exist ".\public\standalone.html" (
        copy /Y ".\public\standalone.html" ".\build\"
        echo Copied standalone.html to build directory.
    ) else (
        echo standalone.html not found in public directory.
        echo Creating standalone.html from scratch...
        
        rem Create minimal standalone.html
        echo ^<!DOCTYPE html^> > ".\build\standalone.html"
        echo ^<html lang="en"^> >> ".\build\standalone.html"
        echo ^<head^> >> ".\build\standalone.html"
        echo   ^<meta charset="utf-8" /^> >> ".\build\standalone.html"
        echo   ^<meta name="viewport" content="width=device-width, initial-scale=1" /^> >> ".\build\standalone.html"
        echo   ^<title^>GLITCH.CRT_EDITOR ^| STANDALONE MODE^</title^> >> ".\build\standalone.html"
        echo   ^<style^> >> ".\build\standalone.html"
        echo     body, html { >> ".\build\standalone.html"
        echo       margin: 0; >> ".\build\standalone.html"
        echo       padding: 0; >> ".\build\standalone.html"
        echo       height: 100%%; >> ".\build\standalone.html"
        echo       font-family: 'Consolas', 'Courier New', monospace; >> ".\build\standalone.html"
        echo       background-color: #000; >> ".\build\standalone.html"
        echo       color: #00FF41; >> ".\build\standalone.html"
        echo     } >> ".\build\standalone.html"
        echo     .container { >> ".\build\standalone.html"
        echo       display: flex; >> ".\build\standalone.html"
        echo       flex-direction: column; >> ".\build\standalone.html"
        echo       height: 100vh; >> ".\build\standalone.html"
        echo     } >> ".\build\standalone.html"
        echo     header { >> ".\build\standalone.html"
        echo       background-color: #0D0D0D; >> ".\build\standalone.html"
        echo       color: #00FF41; >> ".\build\standalone.html"
        echo       padding: 10px 20px; >> ".\build\standalone.html"
        echo       border-bottom: 1px solid #00FF41; >> ".\build\standalone.html"
        echo     } >> ".\build\standalone.html"
        echo     main { >> ".\build\standalone.html"
        echo       flex: 1; >> ".\build\standalone.html"
        echo       padding: 20px; >> ".\build\standalone.html"
        echo       display: flex; >> ".\build\standalone.html"
        echo       flex-direction: column; >> ".\build\standalone.html"
        echo     } >> ".\build\standalone.html"
        echo     textarea { >> ".\build\standalone.html"
        echo       flex: 1; >> ".\build\standalone.html"
        echo       background-color: #111; >> ".\build\standalone.html"
        echo       color: #00FF41; >> ".\build\standalone.html"
        echo       border: 1px solid #00FF41; >> ".\build\standalone.html"
        echo       padding: 10px; >> ".\build\standalone.html"
        echo       font-family: monospace; >> ".\build\standalone.html"
        echo       margin-bottom: 20px; >> ".\build\standalone.html"
        echo     } >> ".\build\standalone.html"
        echo     button { >> ".\build\standalone.html"
        echo       background-color: #111; >> ".\build\standalone.html"
        echo       color: #00FF41; >> ".\build\standalone.html"
        echo       border: 1px solid #00FF41; >> ".\build\standalone.html"
        echo       padding: 8px 15px; >> ".\build\standalone.html"
        echo       margin-right: 10px; >> ".\build\standalone.html"
        echo       cursor: pointer; >> ".\build\standalone.html"
        echo     } >> ".\build\standalone.html"
        echo     footer { >> ".\build\standalone.html"
        echo       background-color: #0D0D0D; >> ".\build\standalone.html"
        echo       padding: 5px 10px; >> ".\build\standalone.html"
        echo       border-top: 1px solid #00FF41; >> ".\build\standalone.html"
        echo       display: flex; >> ".\build\standalone.html"
        echo       justify-content: space-between; >> ".\build\standalone.html"
        echo     } >> ".\build\standalone.html"
        echo   ^</style^> >> ".\build\standalone.html"
        echo ^</head^> >> ".\build\standalone.html"
        echo ^<body^> >> ".\build\standalone.html"
        echo   ^<div class="container"^> >> ".\build\standalone.html"
        echo     ^<header^>GLITCH.CRT_EDITOR - STANDALONE MODE^</header^> >> ".\build\standalone.html"
        echo     ^<main^> >> ".\build\standalone.html"
        echo       ^<textarea id="editor" placeholder="Type your text here..."^>^</textarea^> >> ".\build\standalone.html"
        echo       ^<div^> >> ".\build\standalone.html"
        echo         ^<button id="openBtn"^>Open File^</button^> >> ".\build\standalone.html"
        echo         ^<button id="saveBtn"^>Save File^</button^> >> ".\build\standalone.html"
        echo       ^</div^> >> ".\build\standalone.html"
        echo     ^</main^> >> ".\build\standalone.html"
        echo     ^<footer^> >> ".\build\standalone.html"
        echo       ^<div^>OFFLINE MODE^</div^> >> ".\build\standalone.html"
        echo       ^<div id="time"^>^</div^> >> ".\build\standalone.html"
        echo     ^</footer^> >> ".\build\standalone.html"
        echo   ^</div^> >> ".\build\standalone.html"
        echo   ^<script^> >> ".\build\standalone.html"
        echo     // Update time >> ".\build\standalone.html"
        echo     function updateTime() { >> ".\build\standalone.html"
        echo       document.getElementById('time').textContent = new Date().toLocaleTimeString(); >> ".\build\standalone.html"
        echo     } >> ".\build\standalone.html"
        echo     setInterval(updateTime, 1000); >> ".\build\standalone.html"
        echo     updateTime(); >> ".\build\standalone.html"
        echo     // Event listeners >> ".\build\standalone.html"
        echo     document.getElementById('openBtn').addEventListener('click', () =^> { >> ".\build\standalone.html"
        echo       window.electron.ipcRenderer.invoke('open-file-dialog').then(result =^> { >> ".\build\standalone.html"
        echo         if (result ^&^& result.content) { >> ".\build\standalone.html"
        echo           document.getElementById('editor').value = result.content; >> ".\build\standalone.html"
        echo         } >> ".\build\standalone.html"
        echo       }).catch(err =^> { >> ".\build\standalone.html"
        echo         console.error('Failed to open file:', err); >> ".\build\standalone.html"
        echo       }); >> ".\build\standalone.html"
        echo     }); >> ".\build\standalone.html"
        echo     document.getElementById('saveBtn').addEventListener('click', () =^> { >> ".\build\standalone.html"
        echo       window.electron.ipcRenderer.invoke('save-file-dialog', { >> ".\build\standalone.html"
        echo         content: document.getElementById('editor').value >> ".\build\standalone.html"
        echo       }).catch(err =^> { >> ".\build\standalone.html"
        echo         console.error('Failed to save file:', err); >> ".\build\standalone.html"
        echo       }); >> ".\build\standalone.html"
        echo     }); >> ".\build\standalone.html"
        echo   ^</script^> >> ".\build\standalone.html"
        echo ^</body^> >> ".\build\standalone.html"
        echo ^</html^> >> ".\build\standalone.html"
        
        echo Created standalone.html in build directory.
    )
)

rem Check if index.html exists
if not exist ".\build\index.html" (
    echo index.html not found in build directory.
    echo Copying from public directory...
    
    if exist ".\public\index.html" (
        copy /Y ".\public\index.html" ".\build\"
        echo Copied index.html to build directory.
    ) else (
        echo index.html not found in public directory. Cannot continue.
        exit /b 1
    )
)

rem Run the application with network disabled
echo Starting the application in offline mode...
echo This will test the fallback mechanism...
echo Press Ctrl+C to exit the test

rem Run electron directly with offline mode flag
set NODE_ENV=production
set OFFLINE_MODE=true
npx electron .

echo Test completed!
exit /b 0 