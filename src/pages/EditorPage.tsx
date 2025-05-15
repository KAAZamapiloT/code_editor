import React, { useState } from 'react';
import Editor from '../components/Editor';

const EditorPage: React.FC = () => {
  const [fileContent, setFileContent] = useState('');
  const [filePath, setFilePath] = useState<string | undefined>(undefined);

  const handleOpenFile = async () => {
    if (!window.electron) return;
    
    const result = await window.electron.ipcRenderer.invoke('open-file-dialog');
    if (result && !result.error) {
      setFileContent(result.content);
      setFilePath(result.filePath);
    }
  };

  const handleNewFile = () => {
    setFileContent('');
    setFilePath(undefined);
  };

  return (
    <div className="editor-page">
      <div className="toolbar">
        <button onClick={handleNewFile}>New File</button>
        <button onClick={handleOpenFile}>Open File</button>
      </div>
      <Editor initialContent={fileContent} filePath={filePath} />
    </div>
  );
};

export default EditorPage; 