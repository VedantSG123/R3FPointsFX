import './index.css'
import '@radix-ui/themes/styles.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Theme } from '@radix-ui/themes'
import { ThemeProvider } from './providers/ThemeProvider.tsx'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Theme appearance='inherit' accentColor='iris' grayColor='slate'>
        <App />
      </Theme>
    </ThemeProvider>
  </StrictMode>,
)
