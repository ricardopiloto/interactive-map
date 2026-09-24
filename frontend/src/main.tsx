import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import App from './App.tsx'
import { ToastProvider } from './components/ui'
import { applySystemTheme } from './theme/applySystemTheme'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/global.css'

applySystemTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
