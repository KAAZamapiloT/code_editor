#!/bin/bash

# Direct offline mode launcher for GLITCH.CRT_EDITOR
# This script launches the editor directly in offline mode

YELLOW='\033[1;33m'
GREEN='\033[1;32m'
RED='\033[1;31m'
CYAN='\033[1;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}┌─────────────────────────────────────┐${NC}"
echo -e "${CYAN}│  GLITCH.CRT_EDITOR - OFFLINE MODE    │${NC}"
echo -e "${CYAN}└─────────────────────────────────────┘${NC}"

# Check if build directory exists
if [ ! -d "./build" ]; then
    echo -e "${YELLOW}Build directory not found, creating it...${NC}"
    mkdir -p "./build"
fi

# Ensure standalone.html exists
if [ ! -f "./public/standalone.html" ]; then
    echo -e "${RED}Error: standalone.html not found in public directory.${NC}"
    exit 1
fi

# Copy standalone.html to build directory
echo -e "${YELLOW}Copying standalone.html to build directory...${NC}"
cp -f ./public/standalone.html ./build/

# Create a temporary main.js that doesn't rely on node-pty
echo -e "${YELLOW}Creating a simplified main.js for offline mode...${NC}"
TEMP_MAIN="./temp-main.js"

cat > ${TEMP_MAIN} << 'EOF'
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Keep a global reference of the window object
let mainWindow;

// Force offline mode
const isOffline = true;
console.log('Starting in forced offline mode');

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron/preload.js')
    }
  });

  // Try to load the standalone.html directly
  const fallbackPaths = [
    path.join(__dirname, 'build/standalone.html'),
    path.join(__dirname, 'public/standalone.html')
  ];
  
  let fallbackLoaded = false;
  
  for (const fbPath of fallbackPaths) {
    console.log('Trying fallback path:', fbPath);
    if (fs.existsSync(fbPath)) {
      console.log('Loading fallback from:', fbPath);
      mainWindow.loadFile(fbPath);
      fallbackLoaded = true;
      break;
    }
  }
  
  if (!fallbackLoaded) {
    console.log('No fallback HTML files found, cannot continue');
    app.quit();
  }

  // Development tools (uncomment if needed)
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// File handling IPC events
ipcMain.handle('open-file-dialog', async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Text Files', extensions: ['txt', 'md'] },
        { name: 'Source Code', extensions: ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'rs', 'go', 'php', 'rb'] },
        { name: 'Web Files', extensions: ['html', 'css', 'json', 'xml', 'svg'] }
      ]
    });
    
    if (!canceled && filePaths.length > 0) {
      try {
        const content = fs.readFileSync(filePaths[0], 'utf8');
        return { filePath: filePaths[0], content };
      } catch (error) {
        return { error: error.message };
      }
    }
  } catch (error) {
    console.error('Dialog error:', error);
    return { error: 'Could not open file dialog' };
  }
  return null;
});

ipcMain.handle('save-file', async (_, { filePath, content }) => {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('save-file-dialog', async (_, { content }) => {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog({
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'JavaScript', extensions: ['js', 'jsx'] },
        { name: 'TypeScript', extensions: ['ts', 'tsx'] },
        { name: 'Python', extensions: ['py'] },
        { name: 'HTML', extensions: ['html', 'htm'] },
        { name: 'CSS', extensions: ['css', 'scss'] },
        { name: 'Markdown', extensions: ['md'] },
        { name: 'JSON', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (!canceled && filePath) {
      try {
        fs.writeFileSync(filePath, content, 'utf8');
        return { filePath, success: true };
      } catch (error) {
        return { error: error.message };
      }
    }
  } catch (error) {
    console.error('Dialog error:', error);
    return { error: 'Could not open save dialog' };
  }
  return null;
});

// Add quit app handler
ipcMain.handle('quit-app', () => {
  app.quit();
  return { success: true };
});
EOF

# Set offline mode and launch electron with the temporary main.js
echo -e "${GREEN}Launching in offline mode...${NC}"
ELECTRON_NO_ATTACH_CONSOLE=1 electron ${TEMP_MAIN}

# Clean up the temporary file
rm ${TEMP_MAIN}

exit 0 