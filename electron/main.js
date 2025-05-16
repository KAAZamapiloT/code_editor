const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const os = require('os');
const pty = require('node-pty');
const url = require('url');

// Initialize the store for settings
const store = new Store();

// Keep a global reference of the window object
let mainWindow;
let terminals = {};
let terminalCounter = 0;

// Get shell based on platform
const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
const shellArgs = process.platform === 'win32' ? [] : ['--login'];

// Is offline - check environment variable first, will be set by test script
let isOffline = process.env.OFFLINE_MODE === 'true';
console.log('Starting in offline mode:', isOffline);

// Add IPC handler for launching online mode
ipcMain.on('launch-online-mode', () => {
  console.log('Switching to online mode...');
  // Set offline mode to false in store
  store.set('offlineMode', false);
  
  // Restart the app with OFFLINE_MODE=false
  if (process.platform === 'win32') {
    // On Windows, we need to spawn a new process
    const appPath = process.execPath;
    const args = process.argv.slice(1).filter(arg => !arg.includes('OFFLINE_MODE'));
    require('child_process').spawn(appPath, args, { detached: true });
    app.quit();
  } else {
    // On macOS and Linux, we can reload the current window
    isOffline = false;
    
    // Reset the main window
    if (mainWindow) {
      const isDev = process.env.ELECTRON_START_URL;
      const startUrl = isDev
        ? process.env.ELECTRON_START_URL
        : url.format({
            pathname: path.join(__dirname, '../build/index.html'),
            protocol: 'file:',
            slashes: true
          });
      
      console.log('Reloading window with URL:', startUrl);
      mainWindow.loadURL(startUrl);
    }
  }
});

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#000000', // Set background to black for consistent loading
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Determine if development or production
  const isDev = process.env.ELECTRON_START_URL;

  // If we're in offline mode from the environment variable, 
  // load the standalone.html directly instead of trying to load the React app
  if (isOffline) {
    console.log('Starting in forced offline mode');
    
    // Try multiple fallback paths
    const fallbackPaths = [
      path.join(__dirname, '../build/standalone.html'),
      path.join(__dirname, '../public/standalone.html'),
      path.join(__dirname, '../public/offline.html')
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
      console.log('No fallback HTML files found, using embedded fallback');
      // Create a minimal standalone interface if fallback file doesn't exist
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>GLITCH.CRT_EDITOR</title>
        <style>
          body { 
            background: #000; 
            color: #00FF41; 
            font-family: monospace; 
            margin: 0; 
            padding: 20px; 
            display: flex; 
            flex-direction: column; 
            height: 100vh;
          }
          .header {
            border-bottom: 1px solid #00FF41;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 20px;
          }
          textarea {
            flex: 1;
            background: #111;
            color: #00FF41;
            border: 1px solid #00FF41;
            padding: 10px;
            font-family: monospace;
            resize: none;
            margin-bottom: 20px;
          }
          .button {
            background: #111;
            color: #00FF41;
            border: 1px solid #00FF41;
            padding: 8px 15px;
            cursor: pointer;
            margin-right: 10px;
          }
          .footer {
            border-top: 1px solid #00FF41;
            padding-top: 10px;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>
        <div class="header">GLITCH.CRT_EDITOR - STANDALONE MODE</div>
        <textarea id="editor" placeholder="Type your text here..."></textarea>
        <div>
          <button class="button" id="saveBtn">Save Text</button>
          <button class="button" id="loadBtn">Load File</button>
        </div>
        <div class="footer">
          <div>OFFLINE MODE</div>
          <div id="time"></div>
        </div>
        <script>
          // Simple save functionality
          document.getElementById('saveBtn').addEventListener('click', () => {
            window.electron.ipcRenderer.invoke('save-file-dialog', { 
              content: document.getElementById('editor').value 
            });
          });
          
          // Simple load functionality
          document.getElementById('loadBtn').addEventListener('click', () => {
            window.electron.ipcRenderer.invoke('open-file-dialog').then(result => {
              if (result && result.content) {
                document.getElementById('editor').value = result.content;
              }
            });
          });
          
          // Update time
          function updateTime() {
            document.getElementById('time').textContent = new Date().toLocaleTimeString();
          }
          setInterval(updateTime, 1000);
          updateTime();
        </script>
      </body>
      </html>`;
      
      // Write the fallback HTML to a temporary file
      const tempPath = path.join(app.getPath('temp'), 'glitch-editor-fallback.html');
      fs.writeFileSync(tempPath, htmlContent);
      mainWindow.loadFile(tempPath);
    }
    
    // Always open DevTools in offline mode for debugging
    mainWindow.webContents.openDevTools();
    
    return; // Skip the normal loading process
  }

  // Load the index.html from the built React app
  let startUrl;
  if (isDev) {
    startUrl = process.env.ELECTRON_START_URL;
    console.log('Running in development mode');
  } else {
    // In production, use the built files
    startUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      protocol: 'file:',
      slashes: true
    });
    console.log('Running in production mode');
    console.log('Looking for index.html at:', path.join(__dirname, '../build/index.html'));
    if (!fs.existsSync(path.join(__dirname, '../build/index.html'))) {
      console.error('Index.html not found in build directory!');
    }
  }
  
  // Apply startup settings
  const theme = store.get('theme', 'glitch');
  const showTerminal = store.get('showTerminal', false);
  const showSidebar = store.get('showSidebar', true);

  // Set a longer timeout for initial load
  const loadTimeout = setTimeout(() => {
    if (mainWindow) {
      console.log('Load timeout occurred, trying fallback...');
      isOffline = true;
      
      // Try multiple fallback paths
      const fallbackPaths = [
        path.join(__dirname, '../build/standalone.html'),
        path.join(__dirname, '../public/standalone.html'),
        path.join(__dirname, '../public/offline.html')
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
        console.log('No fallback HTML files found, using embedded fallback');
        // Create a minimal standalone interface if fallback file doesn't exist
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>GLITCH.CRT_EDITOR</title>
          <style>
            body { 
              background: #000; 
              color: #00FF41; 
              font-family: monospace; 
              margin: 0; 
              padding: 20px; 
              display: flex; 
              flex-direction: column; 
              height: 100vh;
            }
            .header {
              border-bottom: 1px solid #00FF41;
              padding-bottom: 10px;
              margin-bottom: 20px;
              font-size: 20px;
            }
            textarea {
              flex: 1;
              background: #111;
              color: #00FF41;
              border: 1px solid #00FF41;
              padding: 10px;
              font-family: monospace;
              resize: none;
              margin-bottom: 20px;
            }
            .button {
              background: #111;
              color: #00FF41;
              border: 1px solid #00FF41;
              padding: 8px 15px;
              cursor: pointer;
              margin-right: 10px;
            }
            .footer {
              border-top: 1px solid #00FF41;
              padding-top: 10px;
              font-size: 12px;
              display: flex;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
          <div class="header">GLITCH.CRT_EDITOR - STANDALONE MODE</div>
          <textarea id="editor" placeholder="Type your text here..."></textarea>
          <div>
            <button class="button" id="saveBtn">Save Text</button>
            <button class="button" id="loadBtn">Load File</button>
          </div>
          <div class="footer">
            <div>OFFLINE MODE</div>
            <div id="time"></div>
          </div>
          <script>
            // Simple save functionality
            document.getElementById('saveBtn').addEventListener('click', () => {
              window.electron.ipcRenderer.invoke('save-file-dialog', { 
                content: document.getElementById('editor').value 
              });
            });
            
            // Simple load functionality
            document.getElementById('loadBtn').addEventListener('click', () => {
              window.electron.ipcRenderer.invoke('open-file-dialog').then(result => {
                if (result && result.content) {
                  document.getElementById('editor').value = result.content;
                }
              });
            });
            
            // Update time
            function updateTime() {
              document.getElementById('time').textContent = new Date().toLocaleTimeString();
            }
            setInterval(updateTime, 1000);
            updateTime();
          </script>
        </body>
        </html>`;
        
        // Write the fallback HTML to a temporary file
        const tempPath = path.join(app.getPath('temp'), 'glitch-editor-fallback.html');
        fs.writeFileSync(tempPath, htmlContent);
        mainWindow.loadFile(tempPath);
      }
    }
  }, 10000); // 10 second timeout

  mainWindow.loadURL(startUrl)
    .then(() => {
      clearTimeout(loadTimeout);
      console.log('App loaded successfully');
      
      // Apply stored theme if available
      mainWindow.webContents.send('apply-theme', theme);
      mainWindow.webContents.send('apply-settings', { 
        theme, 
        showTerminal, 
        showSidebar, 
        isOffline: false 
      });
    })
    .catch(err => {
      console.error('Error loading app:', err);
      isOffline = true;
      // Don't clear the timeout, let it try the fallback
    });

  // Open DevTools in development environment
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Always open DevTools in production for debugging the blank window issue
  if (!isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    // Clean up any terminals when window closes
    Object.keys(terminals).forEach(id => {
      if (terminals[id]) {
        terminals[id].kill();
      }
    });
    terminals = {};
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

// Terminal IPC handlers
ipcMain.on('start-terminal', (event) => {
  const id = `terminal-${terminalCounter++}`;
  const cwd = process.cwd(); // Default to current directory, can be customized
  
  // If we're in offline mode, send a simulated empty response
  if (isOffline) {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('terminal-data', 'Terminal not available in offline mode\r\n$ ');
    }
    return id;
  }
  
  try {
    // Get appropriate shell based on platform
    const shell = process.platform === 'win32' ? 'powershell.exe' : process.platform === 'darwin' ? '/bin/zsh' : '/bin/bash';
    const shellArgs = [];
    
    const terminal = pty.spawn(shell, shellArgs, {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: cwd,
      env: process.env
    });
    
    terminals[id] = terminal;
    
    // Forward terminal output to renderer
    terminal.onData(data => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('terminal-data', data);
      }
    });
    
    // Handle terminal input from renderer
    ipcMain.on('terminal-input', (_, data) => {
      if (terminals[id]) {
        terminals[id].write(data);
      }
    });
    
    // Handle terminal resize
    ipcMain.on('terminal-resize', (_, cols, rows) => {
      if (terminals[id]) {
        terminals[id].resize(cols, rows);
      }
    });
    
    // Clean up when terminal is closed
    ipcMain.on('terminate-terminal', () => {
      if (terminals[id]) {
        terminals[id].kill();
        delete terminals[id];
      }
    });
  } catch (error) {
    console.error('Failed to create terminal:', error);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('terminal-data', `Error: Could not start terminal.\r\nReason: ${error.message}\r\n$ `);
    }
  }
  
  return id;
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

ipcMain.handle('open-folder-dialog', async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    
    if (!canceled && filePaths.length > 0) {
      try {
        const folderPath = filePaths[0];
        return { folderPath };
      } catch (error) {
        return { error: error.message };
      }
    }
  } catch (error) {
    console.error('Dialog error:', error);
    return { error: 'Could not open folder dialog' };
  }
  return null;
});

ipcMain.handle('open-folder', async (_, folderPath) => {
  try {
    const tree = getDirectoryTree(folderPath);
    return { tree };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('read-file', async (_, { filePath }) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { content };
  } catch (error) {
    return { error: error.message };
  }
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

// Check if we're online
ipcMain.handle('check-online-status', () => {
  return { isOffline };
});

// Function to get the directory tree
function getDirectoryTree(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    const tree = [];
    
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Skip node_modules and hidden directories
        if (file === 'node_modules' || file.startsWith('.')) {
          return;
        }
        
        try {
          const children = getDirectoryTree(fullPath);
          tree.push({
            name: file,
            path: fullPath,
            type: 'directory',
            children
          });
        } catch (err) {
          console.error(`Error reading directory ${fullPath}:`, err);
        }
      } else {
        // Skip hidden files
        if (file.startsWith('.')) {
          return;
        }
        
        tree.push({
          name: file,
          path: fullPath,
          type: 'file'
        });
      }
    });
    
    // Sort directories first, then files alphabetically
    return tree.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'directory' ? -1 : 1;
    });
  } catch (error) {
    console.error(`Error reading directory tree: ${error.message}`);
    return [];
  }
}

// Settings management
ipcMain.handle('get-settings', () => {
  return {
    theme: store.get('theme', 'glitch'),
    showTerminal: store.get('showTerminal', false),
    showSidebar: store.get('showSidebar', true),
    focusMode: store.get('focusMode', false),
    isOffline: isOffline
  };
});

ipcMain.handle('save-settings', (_, settings) => {
  if (settings.theme) store.set('theme', settings.theme);
  if (settings.showTerminal !== undefined) store.set('showTerminal', settings.showTerminal);
  if (settings.showSidebar !== undefined) store.set('showSidebar', settings.showSidebar);
  if (settings.focusMode !== undefined) store.set('focusMode', settings.focusMode);
  
  // Apply theme immediately
  if (settings.theme && mainWindow) {
    mainWindow.webContents.send('apply-theme', settings.theme);
  }
  
  return { success: true };
});

// Add quit app handler
ipcMain.handle('quit-app', () => {
  app.quit();
  return { success: true };
}); 