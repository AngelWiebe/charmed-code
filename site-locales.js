export const locales = {
  en: {
    path: '',
    socialLocale: 'en_CA',
    title: 'Charmed Code | Web Design and Development in Alberta',
    description: 'Charmed Code is a web design and development studio in Alberta. We build custom websites, web and mobile apps, and Shopify integrations.',
    imageAlt: 'A moonlit desk with a laptop, looking out on a castle across the water.',
  },
  'fr-CA': {
    path: 'fr/',
    socialLocale: 'fr_CA',
    title: 'Charmed Code | Conception et développement Web en Alberta',
    description: 'Charmed Code est un studio de conception et de développement Web en Alberta. Nous créons des sites sur mesure, des applications Web et mobiles et des intégrations Shopify.',
    imageAlt: 'Un bureau au clair de lune avec un ordinateur portable et une vue sur un château de l’autre côté de l’eau.',
  },
}

export function languagePath(base, locale) {
  return base + locales[locale].path
}

export function languageAt(base, pathname) {
  const frenchPath = languagePath(base, 'fr-CA')
  return pathname === frenchPath || pathname === frenchPath.slice(0, -1) ? 'fr-CA' : 'en'
}
