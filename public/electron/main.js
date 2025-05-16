const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

// Initialize the store for settings
const store = new Store();

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html from the React app
  const startUrl = process.env.ELECTRON_START_URL || 
    `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Apply stored theme if available
  const theme = store.get('theme', 'dark');
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('apply-theme', theme);
  });

  // Open DevTools in development environment
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when app is ready
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// File handling IPC events
ipcMain.handle('open-file-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile']
  });
  
  if (!canceled && filePaths.length > 0) {
    try {
      const content = fs.readFileSync(filePaths[0], 'utf8');
      return { filePath: filePaths[0], content };
    } catch (error) {
      return { error: error.message };
    }
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
  const { canceled, filePath } = await dialog.showSaveDialog({
    filters: [
      { name: 'Text Files', extensions: ['txt', 'js', 'py', 'md', 'json', 'html', 'css'] },
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
  return null;
});

// Settings management
ipcMain.handle('get-settings', () => {
  return {
    theme: store.get('theme', 'dark'),
    showTerminal: store.get('showTerminal', true),
    showFileExplorer: store.get('showFileExplorer', true)
  };
});

ipcMain.handle('save-settings', (_, settings) => {
  if (settings.theme) store.set('theme', settings.theme);
  if (settings.showTerminal !== undefined) store.set('showTerminal', settings.showTerminal);
  if (settings.showFileExplorer !== undefined) store.set('showFileExplorer', settings.showFileExplorer);
  
  // Apply theme immediately
  if (settings.theme && mainWindow) {
    mainWindow.webContents.send('apply-theme', settings.theme);
  }
  
  return { success: true };
}); 