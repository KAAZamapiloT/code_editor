import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './Terminal.css';

const Terminal = ({ theme = 'glitch', onClose }) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  
  useEffect(() => {
    // Initialize xterm.js terminal
    if (terminalRef.current && !xtermRef.current) {
      const term = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: '"Courier New", monospace',
        theme: {
          background: '#000000',
          foreground: theme === 'dark-crt' ? '#ffffff' : '#00FF41',
          cursor: theme === 'dark-crt' ? '#ffffff' : '#00FF41',
          cursorAccent: '#000000',
          selection: theme === 'dark-crt' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 255, 65, 0.3)',
        }
      });
      
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      
      term.open(terminalRef.current);
      fitAddon.fit();
      
      // Add welcome message
      term.writeln('Welcome to GLITCH.CRT_EDITOR Terminal');
      term.writeln('-----------------------------------');
      term.writeln('');
      
      // Set prompt
      term.write('$ ');
      
      // Handle terminal input
      let currentLine = '';
      term.onKey(({ key, domEvent }) => {
        const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
        
        // Handle backspace
        if (domEvent.key === 'Backspace') {
          if (currentLine.length > 0) {
            currentLine = currentLine.substring(0, currentLine.length - 1);
            term.write('\b \b');
          }
        } 
        // Handle Enter
        else if (domEvent.key === 'Enter') {
          term.writeln('');
          if (currentLine.trim().length > 0) {
            handleCommand(currentLine.trim(), term);
          }
          currentLine = '';
          term.write('$ ');
        }
        // Handle printable characters
        else if (printable) {
          currentLine += key;
          term.write(key);
        }
      });
      
      // Handle window resize
      const handleResize = () => {
        try {
          fitAddon.fit();
        } catch (err) {
          console.error('Failed to resize terminal:', err);
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      xtermRef.current = { term, fitAddon };
      
      return () => {
        window.removeEventListener('resize', handleResize);
        term.dispose();
      };
    }
    
    // Update terminal theme when the application theme changes
    if (xtermRef.current) {
      xtermRef.current.term.setOption('theme', {
        background: '#000000',
        foreground: theme === 'dark-crt' ? '#ffffff' : '#00FF41',
        cursor: theme === 'dark-crt' ? '#ffffff' : '#00FF41',
        cursorAccent: '#000000',
        selection: theme === 'dark-crt' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 255, 65, 0.3)',
      });
    }
  }, [theme]);
  
  // Handle terminal commands
  const handleCommand = (command, term) => {
    switch (command.toLowerCase()) {
      case 'help':
        term.writeln('Available commands:');
        term.writeln('  help      - Show this help message');
        term.writeln('  clear     - Clear the terminal');
        term.writeln('  echo      - Echo a message');
        term.writeln('  version   - Show editor version');
        term.writeln('  time      - Show current time');
        term.writeln('  exit      - Close the terminal');
        break;
      case 'clear':
        term.clear();
        break;
      case 'version':
        term.writeln('GLITCH.CRT_EDITOR v1.0.0');
        break;
      case 'time':
        term.writeln(new Date().toLocaleString());
        break;
      case 'exit':
        if (onClose) onClose();
        break;
      default:
        if (command.startsWith('echo ')) {
          term.writeln(command.substring(5));
        } else {
          term.writeln(`Command not found: ${command}`);
        }
    }
  };
  
  return (
    <div className={`terminal-wrapper ${theme === 'dark-crt' ? 'dark-crt' : ''}`}>
      <div className="terminal-header">
        <div className="terminal-title">TERMINAL</div>
        <div className="terminal-actions">
          <button className="terminal-close" onClick={onClose} title="Close Terminal">×</button>
        </div>
      </div>
      <div className="terminal-container" ref={terminalRef}></div>
    </div>
  );
};

export default Terminal; 