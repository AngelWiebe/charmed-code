import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export function render(locale) {
  return renderToString(<StrictMode><App locale={locale} /></StrictMode>)
}
