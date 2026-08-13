import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { normalizeLocale } from './normalizeLocale'

import ptComum from '../locales/pt-BR/comum.json'
import ptMapa from '../locales/pt-BR/mapa.json'
import ptRelacoes from '../locales/pt-BR/relacoes.json'
import ptAdmin from '../locales/pt-BR/admin.json'

import enComum from '../locales/en/comum.json'
import enMapa from '../locales/en/mapa.json'
import enRelacoes from '../locales/en/relacoes.json'
import enAdmin from '../locales/en/admin.json'

const detector = new LanguageDetector()
detector.addDetector({
  name: 'normalizedNavigator',
  lookup() {
    if (typeof navigator === 'undefined') return undefined
    return normalizeLocale(navigator.language)
  },
})

void i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': {
        comum: ptComum,
        mapa: ptMapa,
        relacoes: ptRelacoes,
        admin: ptAdmin,
      },
      en: {
        comum: enComum,
        mapa: enMapa,
        relacoes: enRelacoes,
        admin: enAdmin,
      },
    },
    ns: ['comum', 'mapa', 'relacoes', 'admin'],
    defaultNS: 'comum',
    supportedLngs: ['pt-BR', 'en'],
    fallbackLng: { en: ['pt-BR'], default: ['pt-BR'] },
    load: 'currentOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'normalizedNavigator'],
      caches: ['localStorage'],
      convertDetectedLanguage: (lng) => normalizeLocale(lng),
    },
  })

export default i18n
