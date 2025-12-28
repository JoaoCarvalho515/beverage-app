import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from './localization';

type Language = 'en' | 'pt' | 'es';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load saved language on mount (non-blocking)
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('app-language');
        if (savedLanguage && ['en', 'pt', 'es'].includes(savedLanguage)) {
          const lang = savedLanguage as Language;
          i18n.setLocale(lang);
          setLanguageState(lang);
        }
      } catch (error) {
        console.error('Error loading language:', error);
        // Continue with default language
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    i18n.setLocale(lang);
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('app-language', lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return i18n.t(key);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
