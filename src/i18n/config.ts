import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation namespaces
import enCommon from '../locales/en/common.json';
import enAuth from '../locales/en/auth.json';
import enDashboard from '../locales/en/dashboard.json';
import enAdmin from '../locales/en/admin.json';
import enVisits from '../locales/en/visits.json';
import enRecruitment from '../locales/en/recruitment.json';
import enTable from '../locales/en/table.json';
import enModals from '../locales/en/modals.json';
import enTooltips from '../locales/en/tooltips.json';
import enMenaconnect from '../locales/en/menaconnect.json';

import frCommon from '../locales/fr/common.json';
import frAuth from '../locales/fr/auth.json';
import frDashboard from '../locales/fr/dashboard.json';
import frAdmin from '../locales/fr/admin.json';
import frVisits from '../locales/fr/visits.json';
import frRecruitment from '../locales/fr/recruitment.json';
import frTable from '../locales/fr/table.json';
import frModals from '../locales/fr/modals.json';
import frTooltips from '../locales/fr/tooltips.json';
import frMenaconnect from '../locales/fr/menaconnect.json';

import arCommon from '../locales/ar/common.json';
import arAuth from '../locales/ar/auth.json';
import arDashboard from '../locales/ar/dashboard.json';
import arAdmin from '../locales/ar/admin.json';
import arVisits from '../locales/ar/visits.json';
import arRecruitment from '../locales/ar/recruitment.json';
import arTable from '../locales/ar/table.json';
import arModals from '../locales/ar/modals.json';
import arTooltips from '../locales/ar/tooltips.json';
import arMenaconnect from '../locales/ar/menaconnect.json';

import itCommon from '../locales/it/common.json';
import itAuth from '../locales/it/auth.json';
import itDashboard from '../locales/it/dashboard.json';
import itAdmin from '../locales/it/admin.json';
import itVisits from '../locales/it/visits.json';
import itRecruitment from '../locales/it/recruitment.json';
import itTable from '../locales/it/table.json';
import itModals from '../locales/it/modals.json';
import itTooltips from '../locales/it/tooltips.json';
import itMenaconnect from '../locales/it/menaconnect.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    admin: enAdmin,
    visits: enVisits,
    recruitment: enRecruitment,
    table: enTable,
    modals: enModals,
    tooltips: enTooltips,
    menaconnect: enMenaconnect,
  },
  fr: {
    common: frCommon,
    auth: frAuth,
    dashboard: frDashboard,
    admin: frAdmin,
    visits: frVisits,
    recruitment: frRecruitment,
    table: frTable,
    modals: frModals,
    tooltips: frTooltips,
    menaconnect: frMenaconnect,
  },
  ar: {
    common: arCommon,
    auth: arAuth,
    dashboard: arDashboard,
    admin: arAdmin,
    visits: arVisits,
    recruitment: arRecruitment,
    table: arTable,
    modals: arModals,
    tooltips: arTooltips,
    menaconnect: arMenaconnect,
  },
  it: {
    common: itCommon,
    auth: itAuth,
    dashboard: itDashboard,
    admin: itAdmin,
    visits: itVisits,
    recruitment: itRecruitment,
    table: itTable,
    modals: itModals,
    tooltips: itTooltips,
    menaconnect: itMenaconnect,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['en', 'fr', 'ar', 'it'],
    fallbackLng: 'en',
    ns: ['common', 'auth', 'dashboard', 'admin', 'visits', 'recruitment', 'table', 'modals', 'tooltips', 'menaconnect'],
    defaultNS: 'common',
    
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

// Handle RTL direction
i18n.on('languageChanged', (lng) => {
  const dir = i18n.dir(lng);
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

// Set initial direction
const initialDir = i18n.dir(i18n.language);
document.documentElement.dir = initialDir;
document.documentElement.lang = i18n.language;

export default i18n;
