// Preload script runs in a context that has access to both the renderer 
// and the main process. We're directly setting up the IPC here rather than
// using contextBridge to keep things simple.

// This approach works with nodeIntegration: true in the main process
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    ipcRenderer: {
      invoke: (channel, data) => {
        return ipcRenderer.invoke(channel, data);
      },
      on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      },
      removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
      }
    }
  }
); 