import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { ThemeProvider } from 'next-themes'
import './index.css'
import App from './App.tsx'

window.addEventListener('error', e => {
  fetch('http://localhost:8081', { method: 'POST', body: e.message || '' }).catch(()=>console.error(e.message));
});
window.addEventListener('unhandledrejection', e => {
  fetch('http://localhost:8081', { method: 'POST', body: String(e.reason) }).catch(()=>console.error(e.reason));
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
