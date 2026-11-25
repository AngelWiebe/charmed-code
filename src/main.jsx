import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { languageAt } from '../site-locales.js'
import App from './App.jsx'
import './index.css'

const root = document.getElementById('root')
const locale = languageAt(import.meta.env.BASE_URL, window.location.pathname)
document.documentElement.lang = locale
const page = (
  <StrictMode>
    <App locale={locale} />
  </StrictMode>
)

if (root.hasChildNodes()) hydrateRoot(root, page)
else createRoot(root).render(page)
