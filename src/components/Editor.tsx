import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { markdown } from '@codemirror/lang-markdown';

// Access electron API through the contextBridge
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke: (channel: string, data?: any) => Promise<any>;
        on: (channel: string, func: (...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
      }
    }
  }
}

interface EditorProps {
  initialContent?: string;
  filePath?: string;
}

const getLanguageExtension = (filePath: string | undefined) => {
  if (!filePath) return javascript();
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    return javascript();
  } else if (filePath.endsWith('.py')) {
    return python();
  } else if (filePath.endsWith('.md')) {
    return markdown();
  }
  return javascript();
};

const Editor: React.FC<EditorProps> = ({ initialContent = '', filePath }) => {
  const [content, setContent] = useState(initialContent);
  const [currentFilePath, setCurrentFilePath] = useState(filePath);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setContent(initialContent);
    setCurrentFilePath(filePath);
    setIsDirty(false);
  }, [initialContent, filePath]);

  const handleChange = (value: string) => {
    setContent(value);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!isDirty) return;

    if (currentFilePath) {
      const result = await window.electron.ipcRenderer.invoke('save-file', { filePath: currentFilePath, content });
      if (result.success) {
        setIsDirty(false);
      }
    } else {
      const result = await window.electron.ipcRenderer.invoke('save-file-dialog', { content });
      if (result && result.success) {
        setCurrentFilePath(result.filePath);
        setIsDirty(false);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Save on Ctrl+S or Cmd+S
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="editor-container" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="editor-header">
        <span>{currentFilePath || 'Untitled'}{isDirty ? ' *' : ''}</span>
        <button onClick={handleSave}>Save</button>
      </div>
      <CodeMirror
        value={content}
        height="calc(100vh - 80px)"
        extensions={[getLanguageExtension(currentFilePath)]}
        onChange={handleChange}
        theme="dark"
      />
    </div>
  );
};

export default Editor; 