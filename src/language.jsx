import { createContext, useContext } from 'react'
import french from './french.json'

const LanguageContext = createContext(null)

export function LanguageProvider({ locale, children }) {
  function t(message, values = {}) {
    const localized = locale === 'fr-CA' && Object.hasOwn(french, message) ? french[message] : message
    return localized.replace(/\{(\w+)\}/g, (token, key) => values[key] ?? token)
  }

  return (
    <LanguageContext.Provider value={{ locale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
