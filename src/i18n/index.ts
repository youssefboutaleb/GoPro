
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../locales/en/common.json';
import enAuth from '../locales/en/auth.json';
import enDashboard from '../locales/en/dashboard.json';
import enAdmin from '../locales/en/admin.json';
import enVisits from '../locales/en/visits.json';
import enRecruitment from '../locales/en/recruitment.json';

import frCommon from '../locales/fr/common.json';
import frAuth from '../locales/fr/auth.json';
import frDashboard from '../locales/fr/dashboard.json';
import frAdmin from '../locales/fr/admin.json';
import frVisits from '../locales/fr/visits.json';
import frRecruitment from '../locales/fr/recruitment.json';

import arCommon from '../locales/ar/common.json';
import arAuth from '../locales/ar/auth.json';
import arDashboard from '../locales/ar/dashboard.json';
import arAdmin from '../locales/ar/admin.json';
import arVisits from '../locales/ar/visits.json';
import arRecruitment from '../locales/ar/recruitment.json';

import itCommon from '../locales/it/common.json';
import itAuth from '../locales/it/auth.json';
import itDashboard from '../locales/it/dashboard.json';
import itAdmin from '../locales/it/admin.json';
import itVisits from '../locales/it/visits.json';
import itRecruitment from '../locales/it/recruitment.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    admin: enAdmin,
    visits: enVisits,
    recruitment: enRecruitment,
  },
  fr: {
    common: frCommon,
    auth: frAuth,
    dashboard: frDashboard,
    admin: frAdmin,
    visits: frVisits,
    recruitment: frRecruitment,
  },
  ar: {
    common: arCommon,
    auth: arAuth,
    dashboard: arDashboard,
    admin: arAdmin,
    visits: arVisits,
    recruitment: arRecruitment,
  },
  it: {
    common: itCommon,
    auth: itAuth,
    dashboard: itDashboard,
    admin: itAdmin,
    visits: itVisits,
    recruitment: itRecruitment,
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
