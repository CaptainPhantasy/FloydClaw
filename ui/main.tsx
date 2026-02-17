/**
 * ═══════════════════════════════════════════════════════════════════════════
 * APPLICATION ENTRY POINT
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

/* ═══════════════════════════════════════════════════════════════════════════
 * RENDER APPLICATION
 * ═══════════════════════════════════════════════════════════════════════════ */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
