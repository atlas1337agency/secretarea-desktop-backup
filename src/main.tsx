import { createRoot } from 'react-dom/client';
import { IconContext } from '@phosphor-icons/react';
import App from './App.tsx';
import './index.css';

if (
  'serviceWorker' in navigator &&
  (window.location.protocol === 'http:' || window.location.protocol === 'https:')
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // ignore registration errors
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <IconContext.Provider value={{ weight: 'duotone' }}>
    <App />
  </IconContext.Provider>
);
