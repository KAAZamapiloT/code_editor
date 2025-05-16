import React, { useState, useEffect } from 'react';
import './FileExplorer.css';

const FileItem = ({ item, level, onFileClick, selectedFile }) => {
  const [expanded, setExpanded] = useState(false);
  const padding = level * 12;
  
  const isDirectory = item.type === 'directory';
  
  const toggleExpand = () => {
    if (isDirectory) {
      setExpanded(!expanded);
    }
  };
  
  // Choose icon based on file type
  const getIcon = () => {
    if (isDirectory) {
      return expanded ? '📂' : '📁';
    }
    
    const extension = item.name.split('.').pop().toLowerCase();
    
    switch(extension) {
      case 'js':
      case 'jsx': return '📄 JS';
      case 'ts':
      case 'tsx': return '📄 TS';
      case 'css': return '📄 CSS';
      case 'html': return '📄 HTML';
      case 'json': return '📄 JSON';
      case 'md': return '📄 MD';
      case 'py': return '📄 PY';
      default: return '📄';
    }
  };
  
  return (
    <div>
      <div 
        className={`file-item ${selectedFile === item.path ? 'selected' : ''}`} 
        style={{ paddingLeft: `${padding}px` }}
        onClick={() => {
          if (isDirectory) {
            toggleExpand();
          } else {
            onFileClick(item);
          }
        }}
      >
        <span className="file-icon">{getIcon()}</span>
        <span className="file-name">{item.name}</span>
      </div>
      
      {expanded && isDirectory && item.children && (
        <div className="file-children">
          {item.children.map((child, index) => (
            <FileItem 
              key={index} 
              item={child} 
              level={level + 1} 
              onFileClick={onFileClick}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer = ({ onFileClick, selectedFile }) => {
  const [tree, setTree] = useState([]);
  const [rootPath, setRootPath] = useState('');
  
  useEffect(() => {
    // Initialize file explorer if an existing rootPath is stored
    const storedRootPath = localStorage.getItem('rootPath');
    if (storedRootPath) {
      loadFolder(storedRootPath);
    }
  }, []);
  
  const loadFolder = async (folderPath) => {
    if (!window.electron) return;
    
    try {
      // Invoke IPC to get folder structure
      const result = await window.electron.ipcRenderer.invoke('open-folder', folderPath);
      
      if (result && !result.error) {
        setTree(result.tree);
        setRootPath(folderPath);
        localStorage.setItem('rootPath', folderPath);
      }
    } catch (error) {
      console.error('Failed to load folder:', error);
    }
  };

  const handleOpenFolder = async () => {
    if (!window.electron) return;
    
    try {
      const result = await window.electron.ipcRenderer.invoke('open-folder-dialog');
      
      if (result && !result.error) {
        loadFolder(result.folderPath);
      }
    } catch (error) {
      console.error('Failed to open folder dialog:', error);
    }
  };
  
  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <h3>Explorer</h3>
        <button className="open-folder-btn" onClick={handleOpenFolder}>📁 Open Folder</button>
      </div>
      {rootPath && (
        <div className="root-path">
          {rootPath}
        </div>
      )}
      <div className="file-tree">
        {tree.length > 0 ? (
          tree.map((item, index) => (
            <FileItem 
              key={index} 
              item={item} 
              level={0} 
              onFileClick={onFileClick}
              selectedFile={selectedFile}
            />
          ))
        ) : (
          <div className="empty-explorer">
            <p>No folder opened</p>
            <button onClick={handleOpenFolder}>Open Folder</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer; 