// ⭐ All imports must be at the top
import process from 'process';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // ← MUST BE HERE
import App from './App';

// ⭐ Set process globally after imports
window.process = process;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);