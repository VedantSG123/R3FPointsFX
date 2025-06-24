import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { ThemeProvider } from './providers/ThemeProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider storageKey='vite-ui-theme' defaultTheme='dark'>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
