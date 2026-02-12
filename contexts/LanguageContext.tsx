import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types';
import { translations } from '../constants/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.fr;
  dir: 'ltr' | 'rtl';
  formatMoney: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = translations[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-MR' : 'ar-MR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' ' + t.currency;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, formatMoney }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};