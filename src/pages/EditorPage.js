import React, { useState, useEffect } from 'react';
import Editor from '../components/Editor';
import FileExplorer from '../components/FileExplorer';
import './EditorPage.css';

const EditorPage = () => {
  const [fileContent, setFileContent] = useState('');
  const [filePath, setFilePath] = useState(undefined);
  const [activePanel, setActivePanel] = useState('explorer'); // explorer, search, extensions
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFileIndex, setActiveFileIndex] = useState(-1);
  const [showRightPanel, setShowRightPanel] = useState(false);

  useEffect(() => {
    // Load last session if available
    const lastSession = localStorage.getItem('lastSession');
    if (lastSession) {
      try {
        const session = JSON.parse(lastSession);
        if (session.openFiles && session.openFiles.length > 0) {
          setOpenFiles(session.openFiles);
          setActiveFileIndex(session.activeFileIndex || 0);
          const activeFile = session.openFiles[session.activeFileIndex || 0];
          loadFile(activeFile.path);
        }
      } catch (error) {
        console.error('Failed to load last session:', error);
      }
    }
  }, []);

  // Save session when files change
  useEffect(() => {
    if (openFiles.length > 0) {
      const session = { openFiles, activeFileIndex };
      localStorage.setItem('lastSession', JSON.stringify(session));
    }
  }, [openFiles, activeFileIndex]);

  const loadFile = async (path) => {
    if (!window.electron || !path) return;
    
    try {
      const result = await window.electron.ipcRenderer.invoke('read-file', { filePath: path });
      if (result && !result.error) {
        setFileContent(result.content);
        setFilePath(path);
      }
    } catch (error) {
      console.error('Failed to load file:', error);
    }
  };

  const handleOpenFile = async () => {
    if (!window.electron) return;
    
    const result = await window.electron.ipcRenderer.invoke('open-file-dialog');
    if (result && !result.error) {
      setFileContent(result.content);
      setFilePath(result.filePath);
      
      // Add to open files if not already there
      if (!openFiles.find(file => file.path === result.filePath)) {
        const newFile = { 
          name: result.filePath.split('/').pop(), 
          path: result.filePath 
        };
        setOpenFiles([...openFiles, newFile]);
        setActiveFileIndex(openFiles.length);
      } else {
        // Set active if already open
        const index = openFiles.findIndex(file => file.path === result.filePath);
        setActiveFileIndex(index);
      }
    }
  };

  const handleNewFile = () => {
    setFileContent('');
    setFilePath(undefined);
    
    // Add to open files
    const newFile = { 
      name: 'Untitled', 
      path: null,
      isNew: true 
    };
    setOpenFiles([...openFiles, newFile]);
    setActiveFileIndex(openFiles.length);
  };
  
  const handleFileClick = (item) => {
    if (item.type === 'file') {
      // Check if already open
      const existingIndex = openFiles.findIndex(file => file.path === item.path);
      
      if (existingIndex >= 0) {
        // File already open, switch to it
        setActiveFileIndex(existingIndex);
      } else {
        // Add to open files
        const newFile = { 
          name: item.name, 
          path: item.path 
        };
        setOpenFiles([...openFiles, newFile]);
        setActiveFileIndex(openFiles.length);
      }
      
      loadFile(item.path);
    }
  };
  
  const closeFile = (index, event) => {
    event.stopPropagation();
    
    const newOpenFiles = [...openFiles];
    newOpenFiles.splice(index, 1);
    setOpenFiles(newOpenFiles);
    
    // Adjust active index
    if (index === activeFileIndex) {
      if (newOpenFiles.length > 0) {
        const newIndex = Math.min(index, newOpenFiles.length - 1);
        setActiveFileIndex(newIndex);
        loadFile(newOpenFiles[newIndex].path);
      } else {
        setActiveFileIndex(-1);
        setFileContent('');
        setFilePath(undefined);
      }
    } else if (index < activeFileIndex) {
      setActiveFileIndex(activeFileIndex - 1);
    }
  };
  
  const switchToFile = (index) => {
    if (index === activeFileIndex) return;
    
    setActiveFileIndex(index);
    const file = openFiles[index];
    if (file.path) {
      loadFile(file.path);
    } else {
      // New file
      setFileContent('');
      setFilePath(undefined);
    }
  };
  
  const handleSaveSuccess = () => {
    // If it was a new file, update its info
    if (filePath && activeFileIndex >= 0 && openFiles[activeFileIndex].isNew) {
      const updatedFiles = [...openFiles];
      updatedFiles[activeFileIndex] = {
        name: filePath.split('/').pop(),
        path: filePath,
        isNew: false
      };
      setOpenFiles(updatedFiles);
    }
  };

  return (
    <div className="editor-page">
      <div className="panel-container">
        <div className="left-panel">
          <div className="panel-tabs">
            <div 
              className={`panel-tab ${activePanel === 'explorer' ? 'active' : ''}`}
              onClick={() => setActivePanel('explorer')}
              title="Explorer"
            >
              📁
            </div>
            <div 
              className={`panel-tab ${activePanel === 'search' ? 'active' : ''}`}
              onClick={() => setActivePanel('search')}
              title="Search"
            >
              🔍
            </div>
            <div 
              className={`panel-tab ${activePanel === 'extensions' ? 'active' : ''}`}
              onClick={() => setActivePanel('extensions')}
              title="Extensions"
            >
              🧩
            </div>
          </div>
          <div className="panel-content">
            {activePanel === 'explorer' && (
              <FileExplorer 
                onFileClick={handleFileClick}
                selectedFile={filePath}
              />
            )}
            {activePanel === 'search' && (
              <div className="search-panel">
                <input 
                  type="text" 
                  placeholder="Search in files..." 
                  className="search-input"
                />
              </div>
            )}
            {activePanel === 'extensions' && (
              <div className="extensions-panel">
                <p>Extensions panel (coming soon)</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="content-area">
          <div className="toolbar">
            <button onClick={handleNewFile}>New File</button>
            <button onClick={handleOpenFile}>Open File</button>
            <button onClick={() => setShowRightPanel(!showRightPanel)}>
              {showRightPanel ? 'Hide Terminal' : 'Show Terminal'}
            </button>
          </div>
          
          {openFiles.length > 0 && (
            <div className="tabs-container">
              {openFiles.map((file, index) => (
                <div 
                  key={index} 
                  className={`tab ${index === activeFileIndex ? 'active' : ''}`}
                  onClick={() => switchToFile(index)}
                >
                  <span className="tab-name">{file.name}</span>
                  <span 
                    className="tab-close"
                    onClick={(e) => closeFile(index, e)}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div className="editor-wrapper">
            <Editor 
              initialContent={fileContent} 
              filePath={filePath}
              onSaveSuccess={handleSaveSuccess}
            />
          </div>
        </div>
        
        <div className={`right-panel ${showRightPanel ? 'expanded' : ''}`}>
          <div className="terminal-container">
            <div className="terminal-header">
              <span>Terminal</span>
            </div>
            <div className="terminal-content">
              <p>Terminal output will appear here (coming soon)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage; 