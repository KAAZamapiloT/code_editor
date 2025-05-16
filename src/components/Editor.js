import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { rust } from '@codemirror/lang-rust';
import { json } from '@codemirror/lang-json';
import { php } from '@codemirror/lang-php';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';
import { vim } from '@replit/codemirror-vim';
import { EditorView } from '@codemirror/view';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { StatusBar } from './StatusBar';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './Editor.css';
import './CRTTheme.css';
import './GlitchCRTTheme.css';
import './DarkTerminalTheme.css';

// Enhanced language extension getter with more languages
const getLanguageExtension = (filePath) => {
  if (!filePath) return javascript();
  
  const extension = filePath.split('.').pop().toLowerCase();
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return javascript();
    case 'py':
      return python();
    case 'md':
    case 'markdown':
    case 'txt':
      return markdown();
    case 'html':
    case 'htm':
      return html();
    case 'css':
    case 'scss':
    case 'less':
      return css();
    case 'c':
    case 'cpp':
    case 'cc':
    case 'h':
    case 'hpp':
    case 'cxx':
      return cpp();
    case 'java':
      return java();
    case 'rs':
      return rust();
    case 'json':
    case 'jsonc':
      return json();
    case 'php':
      return php();
    case 'sql':
      return sql();
    case 'xml':
    case 'svg':
    case 'xaml':
      return xml();
    default:
      // For unknown extensions, try to guess based on file content or default to JavaScript
      return javascript();
  }
};

// Get file type display name
const getFileType = (filePath) => {
  if (!filePath) return 'Plain Text';
  
  const extension = filePath.split('.').pop().toLowerCase();
  switch (extension) {
    case 'js': return 'JavaScript';
    case 'jsx': return 'React JSX';
    case 'ts': return 'TypeScript';
    case 'tsx': return 'React TSX';
    case 'py': return 'Python';
    case 'md': case 'markdown': return 'Markdown';
    case 'txt': return 'Plain Text';
    case 'html': case 'htm': return 'HTML';
    case 'css': return 'CSS';
    case 'scss': return 'SCSS';
    case 'less': return 'LESS';
    case 'c': return 'C';
    case 'cpp': case 'cc': case 'cxx': return 'C++';
    case 'h': case 'hpp': return 'C/C++ Header';
    case 'java': return 'Java';
    case 'rs': return 'Rust';
    case 'json': case 'jsonc': return 'JSON';
    case 'php': return 'PHP';
    case 'sql': return 'SQL';
    case 'xml': return 'XML';
    case 'svg': return 'SVG';
    case 'xaml': return 'XAML';
    default: return 'Plain Text';
  }
};

const Editor = ({ initialContent = '', filePath, fileTree, onSaveSuccess }) => {
  const [content, setContent] = useState(initialContent);
  const [currentFilePath, setCurrentFilePath] = useState(filePath);
  const [isDirty, setIsDirty] = useState(false);
  const [mode, setMode] = useState('normal'); // normal, insert, visual
  const [theme, setTheme] = useState('glitch'); // glitch, crt, dark-crt, terminal, dark, light
  const [lineCount, setLineCount] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [fileType, setFileType] = useState('Plain Text');
  const [isOfflineMode, setIsOfflineMode] = useState(!window.navigator.onLine);
  const terminalRef = useRef(null);
  const terminalAddon = useRef(null);
  const terminalInstance = useRef(null);
  const commandInputRef = useRef(null);

  useEffect(() => {
    setContent(initialContent);
    setCurrentFilePath(filePath);
    setIsDirty(false);
    
    // Update line count and file type when content changes
    const lines = initialContent.split('\n');
    setLineCount(lines.length);
    setFileType(getFileType(filePath));
    
    // Check if we're running in Electron
    const isElectron = window.electron !== undefined;
    if (!isElectron) {
      addNotification('Running in offline browser mode. Some features may be limited.', 'warning');
    }
    
    // Add online/offline event listeners
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [initialContent, filePath]);

  // Handle online/offline status changes
  const handleOnlineStatusChange = () => {
    const isOnline = window.navigator.onLine;
    setIsOfflineMode(!isOnline);
    if (!isOnline) {
      addNotification('You are offline. Changes will be saved locally.', 'warning');
    } else {
      addNotification('You are back online.', 'info');
    }
  };

  // Initialize terminal if shown
  useEffect(() => {
    if (showTerminal && terminalRef.current) {
      if (!terminalInstance.current) {
        terminalInstance.current = new Terminal({
          fontFamily: theme === 'glitch' ? "'VT323', monospace" : "'Consolas', monospace",
          fontSize: 14,
          cursorBlink: true,
          cursorStyle: 'block',
          theme: {
            background: '#000000',
            foreground: theme === 'glitch' ? '#00FF41' : '#FFFFFF',
            cursor: theme === 'glitch' ? '#00FF41' : '#FFFFFF'
          }
        });
        
        terminalAddon.current = new FitAddon();
        terminalInstance.current.loadAddon(terminalAddon.current);
        terminalInstance.current.open(terminalRef.current);
        terminalAddon.current.fit();
        
        // Connect to backend terminal process if electron is available
        if (window.electron) {
          window.electron.ipcRenderer.on('terminal-data', (_, data) => {
            terminalInstance.current.write(data);
          });
          
          terminalInstance.current.onData(data => {
            window.electron.ipcRenderer.send('terminal-input', data);
          });
          
          // Request a new terminal session
          window.electron.ipcRenderer.send('start-terminal');
        } else {
          // Provide a simulated terminal experience when running in browser
          terminalInstance.current.write('Terminal emulation in offline mode\r\n');
          terminalInstance.current.write('Only basic commands are supported\r\n\r\n');
          
          // Set up a basic command handler for the emulated terminal
          let commandBuffer = '';
          terminalInstance.current.onData(data => {
            // Handle backspace
            if (data === '\x7f') {
              if (commandBuffer.length > 0) {
                commandBuffer = commandBuffer.slice(0, -1);
                terminalInstance.current.write('\b \b');
              }
              return;
            }
            
            // Handle enter
            if (data === '\r') {
              terminalInstance.current.write('\r\n');
              handleSimulatedCommand(commandBuffer);
              commandBuffer = '';
              terminalInstance.current.write('\r\n$ ');
              return;
            }
            
            // Echo other characters
            terminalInstance.current.write(data);
            commandBuffer += data;
          });
          
          terminalInstance.current.write('$ ');
        }
      }
      
      // Adjust terminal size when shown
      setTimeout(() => {
        if (terminalAddon.current) {
          terminalAddon.current.fit();
        }
      }, 100);
    }
    
    return () => {
      // Clean up terminal on unmount
      if (terminalInstance.current && window.electron) {
        window.electron.ipcRenderer.send('terminate-terminal');
      }
    };
  }, [showTerminal, theme]);

  // Handle simulated commands in browser mode
  const handleSimulatedCommand = (command) => {
    const cmd = command.trim().toLowerCase();
    const terminal = terminalInstance.current;
    
    if (cmd === 'help') {
      terminal.write('Available commands:\r\n');
      terminal.write('  help     - Show this help\r\n');
      terminal.write('  clear    - Clear the terminal\r\n');
      terminal.write('  date     - Show current date and time\r\n');
      terminal.write('  echo     - Echo text back\r\n');
      terminal.write('  ls       - List files (simulated)\r\n');
    } else if (cmd === 'clear') {
      terminal.clear();
    } else if (cmd === 'date') {
      terminal.write(new Date().toString() + '\r\n');
    } else if (cmd.startsWith('echo ')) {
      terminal.write(cmd.substring(5) + '\r\n');
    } else if (cmd === 'ls') {
      terminal.write('Documents/\r\n');
      terminal.write('Projects/\r\n');
      terminal.write('README.md\r\n');
      terminal.write('index.js\r\n');
      terminal.write('styles.css\r\n');
    } else if (cmd) {
      terminal.write(`Command not found: ${cmd}\r\n`);
      terminal.write('Type "help" for available commands\r\n');
    }
  };

  const handleChange = (value) => {
    setContent(value);
    setIsDirty(true);
    
    // Update line count
    const lines = value.split('\n');
    setLineCount(lines.length);
  };

  const handleSave = async () => {
    if (!isDirty) return;

    // If we're running in Electron with IPC
    if (window.electron) {
      if (currentFilePath) {
        try {
          const result = await window.electron.ipcRenderer.invoke('save-file', { 
            filePath: currentFilePath, 
            content 
          });
          if (result.success) {
            setIsDirty(false);
            addNotification(`File saved: ${currentFilePath}`);
            if (onSaveSuccess) onSaveSuccess();
          } else {
            addNotification(`Error saving file: ${result.error}`, 'error');
          }
        } catch (error) {
          addNotification(`Failed to save file: ${error.message}`, 'error');
        }
      } else {
        try {
          const result = await window.electron.ipcRenderer.invoke('save-file-dialog', { content });
          if (result && result.success) {
            setCurrentFilePath(result.filePath);
            setIsDirty(false);
            setFileType(getFileType(result.filePath));
            addNotification(`File saved: ${result.filePath}`);
            if (onSaveSuccess) onSaveSuccess();
          }
        } catch (error) {
          addNotification(`Failed to save file: ${error.message}`, 'error');
        }
      }
    } else {
      // Browser-based saving (using download)
      try {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFilePath ? currentFilePath.split('/').pop() : 'untitled.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsDirty(false);
        addNotification(`File downloaded: ${a.download}`);
      } catch (error) {
        addNotification(`Failed to download file: ${error.message}`, 'error');
      }
    }
  };

  const handleLoadFile = async () => {
    if (window.electron) {
      try {
        const result = await window.electron.ipcRenderer.invoke('open-file-dialog');
        if (result && !result.error) {
          setContent(result.content);
          setCurrentFilePath(result.filePath);
          setFileType(getFileType(result.filePath));
          setIsDirty(false);
          addNotification(`File loaded: ${result.filePath}`);
        }
      } catch (error) {
        console.error('Failed to load file:', error);
        addNotification('Error loading file. See console for details.', 'error');
      }
    } else {
      // Browser-based file loading (using file input)
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.js,.jsx,.ts,.tsx,.py,.md,.html,.css,.c,.cpp,.h,.java,.rs,.json,.php,.sql,.xml';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setContent(event.target.result);
            setCurrentFilePath(file.name);
            setFileType(getFileType(file.name));
            setIsDirty(false);
            addNotification(`File loaded: ${file.name}`);
          };
          reader.onerror = () => {
            addNotification('Error reading file.', 'error');
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }
  };

  const handleKeyDown = (event) => {
    // Save: Ctrl+S
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      handleSave();
    }
    
    // Toggle terminal: Ctrl+`
    if (event.ctrlKey && event.key === '`') {
      event.preventDefault();
      setShowTerminal(!showTerminal);
      
      // Save preference
      if (window.localStorage) {
        const settings = JSON.parse(localStorage.getItem('editor-settings') || '{}');
        settings.showTerminal = !showTerminal;
        localStorage.setItem('editor-settings', JSON.stringify(settings));
      }
      
      // Notify Electron if available
      if (window.electron) {
        window.electron.ipcRenderer.invoke('save-settings', { showTerminal: !showTerminal })
          .catch(error => console.error('Failed to save terminal setting:', error));
      }
    }
    
    // Toggle sidebar: Ctrl+B
    if (event.ctrlKey && event.key === 'b') {
      event.preventDefault();
      toggleFileTree();
    }
    
    // Toggle command palette: Ctrl+Shift+P
    if (event.ctrlKey && event.shiftKey && event.key === 'P') {
      event.preventDefault();
      setShowCommandPalette(!showCommandPalette);
    }
    
    // Toggle theme: Ctrl+Shift+T
    if (event.ctrlKey && event.shiftKey && event.key === 'T') {
      event.preventDefault();
      // Cycle through themes
      const themes = ['glitch', 'crt', 'dark-crt', 'terminal', 'dark', 'light'];
      const currentIndex = themes.indexOf(theme);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      setTheme(nextTheme);
      
      // Save preference
      if (window.localStorage) {
        const settings = JSON.parse(localStorage.getItem('editor-settings') || '{}');
        settings.theme = nextTheme;
        localStorage.setItem('editor-settings', JSON.stringify(settings));
      }
      
      // Notify Electron if available
      if (window.electron) {
        window.electron.ipcRenderer.invoke('save-settings', { theme: nextTheme })
          .catch(error => console.error('Failed to save theme setting:', error));
      }
    }
  };
  
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };
  
  // Get the current theme classes
  const getThemeClass = () => {
    switch (theme) {
      case 'glitch': return 'glitch-theme';
      case 'crt': return 'crt-theme';
      case 'dark-crt': return 'dark-crt-theme';
      case 'terminal': return 'terminal-theme';
      case 'light': return 'light-theme';
      default: return 'dark-theme';
    }
  };

  // Execute command from command palette
  const executeCommand = (command) => {
    setShowCommandPalette(false);
    
    switch (command) {
      case 'save':
        handleSave();
        break;
      case 'load':
        handleLoadFile();
        break;
      case 'theme:glitch':
        setTheme('glitch');
        break;
      case 'theme:terminal':
        setTheme('terminal');
        break;
      case 'theme:dark':
        setTheme('dark');
        break;
      case 'theme:light':
        setTheme('light');
        break;
      case 'toggle:sidebar':
        setShowSidebar(!showSidebar);
        break;
      case 'toggle:terminal':
        setShowTerminal(!showTerminal);
        break;
      case 'toggle:focus':
        setFocusMode(!focusMode);
        break;
      default:
        addNotification(`Unknown command: ${command}`, 'warning');
    }
  };

  const isGlitchTheme = theme === 'glitch';
  const isCRTTheme = theme === 'crt' || theme === 'dark-crt';
  const isTerminalTheme = theme === 'terminal';
  const hasSpecialEffects = isGlitchTheme || isCRTTheme;

  // Toggle file tree visibility
  const toggleFileTree = () => {
    setShowSidebar(!showSidebar);
    
    // Save the preference
    if (window.localStorage) {
      const settings = JSON.parse(localStorage.getItem('editor-settings') || '{}');
      settings.showSidebar = !showSidebar;
      localStorage.setItem('editor-settings', JSON.stringify(settings));
    }
    
    // Notify Electron (if available)
    if (window.electron) {
      window.electron.ipcRenderer.invoke('save-settings', { showSidebar: !showSidebar })
        .catch(error => console.error('Failed to save sidebar setting:', error));
    }
  };

  // Load saved settings
  useEffect(() => {
    // Attempt to load settings
    if (window.localStorage) {
      try {
        const settings = JSON.parse(localStorage.getItem('editor-settings') || '{}');
        
        // Apply theme if saved
        if (settings.theme) {
          setTheme(settings.theme);
        }
        
        // Apply sidebar visibility
        if (settings.showSidebar !== undefined) {
          setShowSidebar(settings.showSidebar);
        }
        
        // Apply terminal visibility
        if (settings.showTerminal !== undefined) {
          setShowTerminal(settings.showTerminal);
        }
        
        // Apply Vim mode
        if (settings.vimMode) {
          setMode(settings.vimMode === true ? 'normal' : 'insert');
        }
        
        // Apply focus mode
        if (settings.focusMode) {
          setFocusMode(settings.focusMode);
        }
      } catch (error) {
        console.error('Error loading editor settings:', error);
      }
    }
  }, []);

  return (
    <div 
      className={`editor-container ${getThemeClass()} 
                 ${isGlitchTheme ? 'glitch-monitor' : isCRTTheme ? 'crt-monitor' : ''} 
                 ${isGlitchTheme ? 'glitch-startup' : ''}
                 ${focusMode ? 'focus-mode' : ''}`} 
      onKeyDown={handleKeyDown} 
      tabIndex={0}
      data-sidebar-visible={showSidebar}
    >
      <div className={`editor-header ${isGlitchTheme ? 'glitch-text' : isCRTTheme ? 'crt-text' : ''}`}>
        <div className="file-info">
          <span className="file-path">{currentFilePath || 'Untitled'}{isDirty ? ' *' : ''}</span>
          <span className="file-type">{fileType}</span>
          {isOfflineMode && <span className="offline-indicator">OFFLINE MODE</span>}
        </div>
        <div className="editor-actions">
          <button className="action-button" onClick={toggleFileTree} title="Toggle Sidebar (Ctrl+B)">
            {showSidebar ? '◀' : '▶'}
          </button>
          <button className="action-button" onClick={() => setFocusMode(!focusMode)} title="Toggle Focus Mode (F11)">
            {focusMode ? '⊞' : '⊡'}
          </button>
          <button className="action-button" onClick={handleLoadFile} title="Load File">
            📂
          </button>
          <button className="action-button" onClick={() => setShowTerminal(!showTerminal)} title="Toggle Terminal (Ctrl+`)">
            ⌨
          </button>
          <button className="action-button" onClick={() => setShowCommandPalette(true)} title="Command Palette (Ctrl+Shift+P)">
            ⌘P
          </button>
          <button className="action-button" onClick={handleSave} title="Save (Ctrl+S)">
            Save
          </button>
          <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="theme-selector"
            title="Change Theme (Ctrl+Shift+T)"
          >
            <option value="glitch">Glitch CRT</option>
            <option value="crt">CRT Terminal</option>
            <option value="dark-crt">High Contrast CRT</option>
            <option value="terminal">Dark Terminal</option>
            <option value="dark">VS Code</option>
            <option value="light">Light</option>
          </select>
        </div>
      </div>
      
      <div className="editor-content">
        <CodeMirror
          value={content}
          height="100%"
          extensions={[
            getLanguageExtension(currentFilePath),
            EditorView.lineWrapping,
            autocompletion(),
            EditorView.updateListener.of((update) => {
              if (update.selectionSet) {
                const selection = update.state.selection.main;
                const line = update.state.doc.lineAt(selection.head);
                setCursorPosition({
                  line: line.number,
                  col: selection.head - line.from + 1
                });
              }
            })
          ]}
          onChange={handleChange}
          theme={hasSpecialEffects || isTerminalTheme ? 'dark' : theme}
          className={`code-mirror-wrapper ${isGlitchTheme ? 'glitch-text' : isCRTTheme ? 'crt-text' : ''}`}
          onKeyDown={handleKeyDown}
        />
      </div>
      
      {showTerminal && (
        <div className="terminal-wrapper">
          <div className="terminal-header">
            <span>Terminal {isOfflineMode ? '(Offline Mode)' : ''}</span>
            <button className="terminal-close" onClick={() => setShowTerminal(false)}>×</button>
          </div>
          <div ref={terminalRef} className="terminal-container"></div>
        </div>
      )}
      
      <StatusBar 
        mode={mode} 
        filePath={currentFilePath} 
        cursorPosition={cursorPosition}
        lineCount={lineCount}
        isDirty={isDirty}
        isCRT={isCRTTheme}
        isGlitch={isGlitchTheme}
        fileType={fileType}
        isOffline={isOfflineMode}
      />
      
      {showCommandPalette && (
        <div className={`command-palette ${isGlitchTheme ? 'glitch-text' : isCRTTheme ? 'crt-text' : ''}`}>
          <div className="command-palette-header">
            <input 
              ref={commandInputRef}
              type="text" 
              placeholder="Type a command..."
              autoFocus
              onBlur={() => setTimeout(() => setShowCommandPalette(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowCommandPalette(false);
                }
              }}
              className={hasSpecialEffects ? (isGlitchTheme ? 'glitch-text' : 'crt-text') : ''}
            />
          </div>
          <div className="command-list">
            <div className="command-item" onClick={() => executeCommand('save')}>
              <span className="command-name">Save</span>
              <span className="command-shortcut">Ctrl+S</span>
            </div>
            <div className="command-item" onClick={() => executeCommand('load')}>
              <span className="command-name">Load File</span>
              <span className="command-shortcut">Click 📂</span>
            </div>
            <div className="command-item" onClick={() => executeCommand('theme:glitch')}>
              <span className="command-name">Glitch CRT Theme</span>
              <span className="command-shortcut">Theme Menu</span>
            </div>
            <div className="command-item" onClick={() => executeCommand('theme:terminal')}>
              <span className="command-name">Dark Terminal Theme</span>
              <span className="command-shortcut">Theme Menu</span>
            </div>
            <div className="command-item" onClick={() => executeCommand('toggle:sidebar')}>
              <span className="command-name">Toggle Sidebar</span>
              <span className="command-shortcut">Ctrl+B</span>
            </div>
            <div className="command-item" onClick={() => executeCommand('toggle:terminal')}>
              <span className="command-name">Toggle Terminal</span>
              <span className="command-shortcut">Ctrl+`</span>
            </div>
            <div className="command-item" onClick={() => executeCommand('toggle:focus')}>
              <span className="command-name">Toggle Focus Mode</span>
              <span className="command-shortcut">F11</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="notifications">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`notification ${notification.type} ${isGlitchTheme ? 'glitch-text' : isCRTTheme ? 'crt-text' : ''}`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Editor; 