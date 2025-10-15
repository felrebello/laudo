// garante a existência da global em prod
;(globalThis as any).isOfflineMode = (globalThis as any).isOfflineMode ?? false

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
