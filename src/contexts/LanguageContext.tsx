
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Common
    'common.back': 'Back',
    'common.search': 'Search',
    'common.filters': 'Filters',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.signOut': 'Sign Out',
    'common.admin': 'Admin',
    'common.userConnected': 'User Connected',
    'common.week': 'Week',
    'common.month': 'Month',
    'common.territory': 'Territory',
    'common.specialty': 'Specialty',
    'common.allSpecialties': 'All specialties',
    'common.allTerritories': 'All territories',
    'common.noDataFound': 'No data found',
    'common.tryModifyingCriteria': 'Try modifying your search criteria.',
    
    // Header
    'header.welcome': 'Welcome to GOPRO',
    'header.description': 'Your medical performance reporting and goal management tool',
    'header.getStarted': 'Get Started Now',
    'header.signIn': 'Sign In',
    
    // Dashboard
    'dashboard.returnIndex': 'Return Index',
    'dashboard.returnIndexDesc': 'Analyze doctors by specialty and brick',
    'dashboard.recruitmentRate': 'Recruitment Rate',
    'dashboard.recruitmentRateDesc': 'Track sales and goals by product',
    'dashboard.totalDoctors': 'Total doctors',
    'dashboard.bySpecialty': 'By specialty',
    'dashboard.byBrick': 'By brick',
    'dashboard.products': 'Products',
    'dashboard.averageGoal': 'Average goal',
    'dashboard.consultIndex': 'Consult index',
    'dashboard.consultRate': 'Consult rate',
    
    // Doctors
    'doctors.targetedDoctors': 'Targeted Doctors',
    'doctors.doctorsFound': 'doctors found',
    'doctors.doctorName': 'Doctor name...',
    'doctors.selectWeek': 'Select week',
    'doctors.noDoctorsFound': 'No doctors found',
    'doctors.specialtyNotSpecified': 'Specialty not specified',
    'doctors.territoryNotAssigned': 'Territory not assigned',
    'doctors.notSpecified': 'Not specified',
    'doctors.lastVisit': 'Last visit',
    'doctors.monthlyPerformance': 'Monthly performance',
    'doctors.visits': 'Visits',
    'doctors.sector': 'Sector',
    'doctors.notAssigned': 'Not assigned',
    'doctors.active': 'Active',
    
    // Return Index
    'returnIndex.title': 'Return Index',
    'returnIndex.doctorsNeedingVisits': 'doctors needing visits this month',
    'returnIndex.delegate': 'Delegate',
    'returnIndex.swipeHint': '💡 Swipe a row to the right to record a visit today',
    'returnIndex.globalIndex': 'Global Index',
    'returnIndex.detailedReport': 'Detailed Report',
    'returnIndex.doctorsNeedingVisitsThisMonth': 'Doctors needing visits this month',
    'returnIndex.noDoctorsNeedingVisits': 'No doctors needing visits',
    'returnIndex.allDoctorsReachedFrequency': 'All doctors have reached their visit frequency for this month.',
    'returnIndex.firstName': 'First Name',
    'returnIndex.lastName': 'Last Name',
    'returnIndex.visitFrequency': 'Visit frequency',
    'returnIndex.visitsToMake': 'Visits to make',
    'returnIndex.visitRecorded': 'Visit recorded',
    'returnIndex.perMonth': '/ month',
    'returnIndex.loadingReturnData': 'Loading return index data...',
    'returnIndex.noDelegateFound': 'No delegate found for this user.',
    
    // Language
    'language.english': 'English',
    'language.french': 'French',
    'language.selectLanguage': 'Select Language'
  },
  fr: {
    // Common
    'common.back': 'Retour',
    'common.search': 'Recherche',
    'common.filters': 'Filtres',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.signOut': 'Déconnexion',
    'common.admin': 'Admin',
    'common.userConnected': 'Utilisateur connecté',
    'common.week': 'Semaine',
    'common.month': 'Mois',
    'common.territory': 'Territoire',
    'common.specialty': 'Spécialité',
    'common.allSpecialties': 'Toutes spécialités',
    'common.allTerritories': 'Tous les territoires',
    'common.noDataFound': 'Aucune donnée trouvée',
    'common.tryModifyingCriteria': 'Essayez de modifier vos critères de recherche.',
    
    // Header
    'header.welcome': 'Bienvenue dans GOPRO',
    'header.description': 'Votre outil de reporting de performance et de gestion des objectifs médicaux',
    'header.getStarted': 'Commencer maintenant',
    'header.signIn': 'Se connecter',
    
    // Dashboard
    'dashboard.returnIndex': 'Indice de Retour',
    'dashboard.returnIndexDesc': 'Analyse des médecins par spécialité et brick',
    'dashboard.recruitmentRate': 'Rythme de Recrutement',
    'dashboard.recruitmentRateDesc': 'Suivi des ventes et objectifs par produit',
    'dashboard.totalDoctors': 'Total médecins',
    'dashboard.bySpecialty': 'Par spécialité',
    'dashboard.byBrick': 'Par brick',
    'dashboard.products': 'Produits',
    'dashboard.averageGoal': 'Objectif moyen',
    'dashboard.consultIndex': "Consulter l'indice",
    'dashboard.consultRate': 'Consulter le rythme',
    
    // Doctors
    'doctors.targetedDoctors': 'Médecins Ciblés',
    'doctors.doctorsFound': 'médecins trouvés',
    'doctors.doctorName': 'Nom du médecin...',
    'doctors.selectWeek': 'Sélectionner la semaine',
    'doctors.noDoctorsFound': 'Aucun médecin trouvé',
    'doctors.specialtyNotSpecified': 'Spécialité non renseignée',
    'doctors.territoryNotAssigned': 'Territoire non assigné',
    'doctors.notSpecified': 'Non renseigné',
    'doctors.lastVisit': 'Dernière visite',
    'doctors.monthlyPerformance': 'Performance mensuelle',
    'doctors.visits': 'Visites',
    'doctors.sector': 'Secteur',
    'doctors.notAssigned': 'Non assigné',
    'doctors.active': 'Actif',
    
    // Return Index
    'returnIndex.title': 'Indice de Retour',
    'returnIndex.doctorsNeedingVisits': 'médecins nécessitant des visites ce mois',
    'returnIndex.delegate': 'Délégué',
    'returnIndex.swipeHint': '💡 Glissez une ligne vers la droite pour enregistrer une visite aujourd\'hui',
    'returnIndex.globalIndex': 'Indice Global',
    'returnIndex.detailedReport': 'Rapport détaillé',
    'returnIndex.doctorsNeedingVisitsThisMonth': 'Médecins nécessitant des visites ce mois',
    'returnIndex.noDoctorsNeedingVisits': 'Aucun médecin nécessitant des visites',
    'returnIndex.allDoctorsReachedFrequency': 'Tous les médecins ont atteint leur fréquence de visite pour ce mois.',
    'returnIndex.firstName': 'Prénom',
    'returnIndex.lastName': 'Nom',
    'returnIndex.visitFrequency': 'Fréquence de visites',
    'returnIndex.visitsToMake': 'Visites à faire',
    'returnIndex.visitRecorded': 'Visite enregistrée',
    'returnIndex.perMonth': '/ mois',
    'returnIndex.loadingReturnData': 'Chargement des données d\'indice de retour...',
    'returnIndex.noDelegateFound': 'Aucun délégué trouvé pour cet utilisateur.',
    
    // Language
    'language.english': 'Anglais',
    'language.french': 'Français',
    'language.selectLanguage': 'Sélectionner la langue'
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
