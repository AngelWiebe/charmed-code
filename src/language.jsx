import { createContext, useContext, useEffect, useState } from 'react'
import french from './french.json'

const LanguageContext = createContext(null)
const preferenceKey = 'charmed-code-language'
const englishTitle = 'Charmed Code | Web Design and Development in Alberta'
const frenchTitle = 'Charmed Code | Conception et développement Web en Alberta'

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('en')

  useEffect(() => {
    try {
      if (localStorage.getItem(preferenceKey) === 'fr-CA') setLocale('fr-CA')
    } catch {
      // The switcher still works when storage is unavailable.
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = locale === 'fr-CA' ? frenchTitle : englishTitle
  }, [locale])

  function changeLocale(next) {
    setLocale(next)
    try {
      localStorage.setItem(preferenceKey, next)
    } catch {
      // The current selection is kept in memory.
    }
  }

  function t(message, values = {}) {
    const localized = locale === 'fr-CA' && Object.hasOwn(french, message) ? french[message] : message
    return localized.replace(/\{(\w+)\}/g, (token, key) => values[key] ?? token)
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale: changeLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
