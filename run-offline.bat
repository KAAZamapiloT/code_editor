@echo off
rem Direct offline mode launcher for GLITCH.CRT_EDITOR
rem This script launches the editor directly in offline mode

echo.
echo  ___________.____     __________  ___________ ___________________  ________
echo  \__    ___/|    |    \______   \/   _____/  \_   ___ \__    ___/ /  _____/
echo    |    |   |    |     |    |  _/\_____  \   /    \  \/ |    |   /   \  ___
echo    |    |   |    |___  |    |   \/        \  \     \____|    |   \    \_\  \
echo    |____|   |_______ \ |______  /_______  /   \______  /|____|    \______  /
echo                      \/        \/        \/           \/                  \/
echo.

rem Check if build directory exists
if not exist ".\build" (
    echo Build directory not found, creating it...
    mkdir ".\build"
)

rem Ensure standalone.html exists
if not exist ".\public\standalone.html" (
    echo Error: standalone.html not found in public directory.
    exit /b 1
)

rem Copy standalone.html to build directory
echo Copying standalone.html to build directory...
copy /Y ".\public\standalone.html" ".\build\"

rem Create a temporary main.js that doesn't rely on node-pty
echo Creating a simplified main.js for offline mode...
set TEMP_MAIN=temp-main.js

echo const { app, BrowserWindow, ipcMain, dialog } = require('electron'); > %TEMP_MAIN%
echo const path = require('path'); >> %TEMP_MAIN%
echo const fs = require('fs'); >> %TEMP_MAIN%
echo const url = require('url'); >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo // Keep a global reference of the window object >> %TEMP_MAIN%
echo let mainWindow; >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo // Force offline mode >> %TEMP_MAIN%
echo const isOffline = true; >> %TEMP_MAIN%
echo console.log('Starting in forced offline mode'); >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo function createWindow() { >> %TEMP_MAIN%
echo   // Create the browser window >> %TEMP_MAIN%
echo   mainWindow = new BrowserWindow({ >> %TEMP_MAIN%
echo     width: 1200, >> %TEMP_MAIN%
echo     height: 800, >> %TEMP_MAIN%
echo     backgroundColor: '#000000', >> %TEMP_MAIN%
echo     webPreferences: { >> %TEMP_MAIN%
echo       nodeIntegration: false, >> %TEMP_MAIN%
echo       contextIsolation: true, >> %TEMP_MAIN%
echo       preload: path.join(__dirname, 'electron/preload.js') >> %TEMP_MAIN%
echo     } >> %TEMP_MAIN%
echo   }); >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo   // Try to load the standalone.html directly >> %TEMP_MAIN%
echo   const fallbackPaths = [ >> %TEMP_MAIN%
echo     path.join(__dirname, 'build/standalone.html'), >> %TEMP_MAIN%
echo     path.join(__dirname, 'public/standalone.html') >> %TEMP_MAIN%
echo   ]; >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo   let fallbackLoaded = false; >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo   for (const fbPath of fallbackPaths) { >> %TEMP_MAIN%
echo     console.log('Trying fallback path:', fbPath); >> %TEMP_MAIN%
echo     if (fs.existsSync(fbPath)) { >> %TEMP_MAIN%
echo       console.log('Loading fallback from:', fbPath); >> %TEMP_MAIN%
echo       mainWindow.loadFile(fbPath); >> %TEMP_MAIN%
echo       fallbackLoaded = true; >> %TEMP_MAIN%
echo       break; >> %TEMP_MAIN%
echo     } >> %TEMP_MAIN%
echo   } >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo   if (!fallbackLoaded) { >> %TEMP_MAIN%
echo     console.log('No fallback HTML files found, cannot continue'); >> %TEMP_MAIN%
echo     app.quit(); >> %TEMP_MAIN%
echo   } >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo   mainWindow.on('closed', () => { >> %TEMP_MAIN%
echo     mainWindow = null; >> %TEMP_MAIN%
echo   }); >> %TEMP_MAIN%
echo } >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo app.on('ready', createWindow); >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo app.on('window-all-closed', () => { >> %TEMP_MAIN%
echo   app.quit(); >> %TEMP_MAIN%
echo }); >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo app.on('activate', () => { >> %TEMP_MAIN%
echo   if (mainWindow === null) { >> %TEMP_MAIN%
echo     createWindow(); >> %TEMP_MAIN%
echo   } >> %TEMP_MAIN%
echo }); >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo // File handling IPC events >> %TEMP_MAIN%
echo ipcMain.handle('open-file-dialog', async () => { >> %TEMP_MAIN%
echo   try { >> %TEMP_MAIN%
echo     const { canceled, filePaths } = await dialog.showOpenDialog({ >> %TEMP_MAIN%
echo       properties: ['openFile'], >> %TEMP_MAIN%
echo       filters: [ >> %TEMP_MAIN%
echo         { name: 'All Files', extensions: ['*'] }, >> %TEMP_MAIN%
echo         { name: 'Text Files', extensions: ['txt', 'md'] }, >> %TEMP_MAIN%
echo         { name: 'Source Code', extensions: ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'rs', 'go', 'php', 'rb'] }, >> %TEMP_MAIN%
echo         { name: 'Web Files', extensions: ['html', 'css', 'json', 'xml', 'svg'] } >> %TEMP_MAIN%
echo       ] >> %TEMP_MAIN%
echo     }); >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo     if (!canceled ^&^& filePaths.length ^> 0) { >> %TEMP_MAIN%
echo       try { >> %TEMP_MAIN%
echo         const content = fs.readFileSync(filePaths[0], 'utf8'); >> %TEMP_MAIN%
echo         return { filePath: filePaths[0], content }; >> %TEMP_MAIN%
echo       } catch (error) { >> %TEMP_MAIN%
echo         return { error: error.message }; >> %TEMP_MAIN%
echo       } >> %TEMP_MAIN%
echo     } >> %TEMP_MAIN%
echo   } catch (error) { >> %TEMP_MAIN%
echo     console.error('Dialog error:', error); >> %TEMP_MAIN%
echo     return { error: 'Could not open file dialog' }; >> %TEMP_MAIN%
echo   } >> %TEMP_MAIN%
echo   return null; >> %TEMP_MAIN%
echo }); >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo ipcMain.handle('save-file', async (_, { filePath, content }) => { >> %TEMP_MAIN%
echo   try { >> %TEMP_MAIN%
echo     fs.writeFileSync(filePath, content, 'utf8'); >> %TEMP_MAIN%
echo     return { success: true }; >> %TEMP_MAIN%
echo   } catch (error) { >> %TEMP_MAIN%
echo     return { error: error.message }; >> %TEMP_MAIN%
echo   } >> %TEMP_MAIN%
echo }); >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo ipcMain.handle('save-file-dialog', async (_, { content }) => { >> %TEMP_MAIN%
echo   try { >> %TEMP_MAIN%
echo     const { canceled, filePath } = await dialog.showSaveDialog({ >> %TEMP_MAIN%
echo       filters: [ >> %TEMP_MAIN%
echo         { name: 'Text Files', extensions: ['txt'] }, >> %TEMP_MAIN%
echo         { name: 'JavaScript', extensions: ['js', 'jsx'] }, >> %TEMP_MAIN%
echo         { name: 'TypeScript', extensions: ['ts', 'tsx'] }, >> %TEMP_MAIN%
echo         { name: 'Python', extensions: ['py'] }, >> %TEMP_MAIN%
echo         { name: 'HTML', extensions: ['html', 'htm'] }, >> %TEMP_MAIN%
echo         { name: 'CSS', extensions: ['css', 'scss'] }, >> %TEMP_MAIN%
echo         { name: 'Markdown', extensions: ['md'] }, >> %TEMP_MAIN%
echo         { name: 'JSON', extensions: ['json'] }, >> %TEMP_MAIN%
echo         { name: 'All Files', extensions: ['*'] } >> %TEMP_MAIN%
echo       ] >> %TEMP_MAIN%
echo     }); >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo     if (!canceled ^&^& filePath) { >> %TEMP_MAIN%
echo       try { >> %TEMP_MAIN%
echo         fs.writeFileSync(filePath, content, 'utf8'); >> %TEMP_MAIN%
echo         return { filePath, success: true }; >> %TEMP_MAIN%
echo       } catch (error) { >> %TEMP_MAIN%
echo         return { error: error.message }; >> %TEMP_MAIN%
echo       } >> %TEMP_MAIN%
echo     } >> %TEMP_MAIN%
echo   } catch (error) { >> %TEMP_MAIN%
echo     console.error('Dialog error:', error); >> %TEMP_MAIN%
echo     return { error: 'Could not open save dialog' }; >> %TEMP_MAIN%
echo   } >> %TEMP_MAIN%
echo   return null; >> %TEMP_MAIN%
echo }); >> %TEMP_MAIN%
echo. >> %TEMP_MAIN%
echo // Add quit app handler >> %TEMP_MAIN%
echo ipcMain.handle('quit-app', () => { >> %TEMP_MAIN%
echo   app.quit(); >> %TEMP_MAIN%
echo   return { success: true }; >> %TEMP_MAIN%
echo }); >> %TEMP_MAIN%

rem Launch electron with the temporary main.js
echo Launching in offline mode...
electron %TEMP_MAIN%

rem Clean up the temporary file
del %TEMP_MAIN%

exit /b 0 