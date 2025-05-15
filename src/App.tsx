import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import EditorPage from './pages/EditorPage';
import './app.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<EditorPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 