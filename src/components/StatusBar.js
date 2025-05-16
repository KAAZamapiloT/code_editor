import React, { useState, useEffect } from 'react';
import './StatusBar.css';

export const StatusBar = ({ mode, filePath, cursorPosition, lineCount, isDirty, isCRT, isGlitch, fileType, isOffline }) => {
  const [time, setTime] = useState(formatTime());
  const [memoryUsage, setMemoryUsage] = useState('');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatTime());
      
      // Update memory usage if window.performance is available
      if (window.performance && window.performance.memory) {
        const used = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
        const total = Math.round(window.performance.memory.jsHeapSizeLimit / (1024 * 1024));
        setMemoryUsage(`${used}MB / ${total}MB`);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const getFileType = () => {
    if (!filePath) return 'plaintext';
    const extension = filePath.split('.').pop().toLowerCase();
    switch (extension) {
      case 'js': return 'JavaScript';
      case 'jsx': return 'React JSX';
      case 'ts': return 'TypeScript';
      case 'tsx': return 'React TSX';
      case 'html': return 'HTML';
      case 'css': return 'CSS';
      case 'json': return 'JSON';
      case 'md': return 'Markdown';
      case 'py': return 'Python';
      default: return extension.toUpperCase();
    }
  };

  function formatTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  return (
    <div className={`status-bar ${isGlitch ? 'glitch-text' : isCRT ? 'crt-text' : ''}`}>
      <div className="status-item mode">
        <span className={`mode-indicator ${mode}`}>{mode.toUpperCase()}</span>
      </div>
      <div className="status-item file-type">
        {fileType || getFileType()}
      </div>
      <div className="status-item cursor-position">
        Ln {cursorPosition.line}, Col {cursorPosition.col}
      </div>
      <div className="status-item line-count">
        {lineCount} lines
      </div>
      {isOffline && (
        <div className="status-item offline-indicator">
          OFFLINE
        </div>
      )}
      {(isCRT || isGlitch) && (
        <div className="status-item time">
          {time}
        </div>
      )}
      {memoryUsage && (
        <div className="status-item memory">
          {memoryUsage}
        </div>
      )}
      <div className="status-item dirty-indicator">
        {isDirty ? '●' : ''}
      </div>
    </div>
  );
}; 