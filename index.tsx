import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';


const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

mountApp();

// Resilient PWA Service Worker Registration
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('PWA Service worker skipped:', err);
    });
  });
}