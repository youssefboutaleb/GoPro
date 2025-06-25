
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../locales/en/common.json';
import enAuth from '../locales/en/auth.json';
import enDashboard from '../locales/en/dashboard.json';
import enAdmin from '../locales/en/admin.json';

import frCommon from '../locales/fr/common.json';
import frAuth from '../locales/fr/auth.json';
import frDashboard from '../locales/fr/dashboard.json';
import frAdmin from '../locales/fr/admin.json';

import arCommon from '../locales/ar/common.json';
import arAuth from '../locales/ar/auth.json';
import arDashboard from '../locales/ar/dashboard.json';
import arAdmin from '../locales/ar/admin.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    admin: enAdmin,
  },
  fr: {
    common: frCommon,
    auth: frAuth,
    dashboard: frDashboard,
    admin: frAdmin,
  },
  ar: {
    common: arCommon,
    auth: arAuth,
    dashboard: arDashboard,
    admin: arAdmin,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie'],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
