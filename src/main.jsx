import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const root = document.getElementById('root')
const page = (
  <StrictMode>
    <App />
  </StrictMode>
)

if (root.hasChildNodes()) hydrateRoot(root, page)
else createRoot(root).render(page)
