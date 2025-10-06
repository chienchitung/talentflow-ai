import React, { createContext, useState, useContext, ReactNode } from 'react';
import en from './locales/en.ts';
import zh from './locales/zh.ts';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  // FIX: Updated function signature to accept an optional replacements object.
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const translations: Record<Language, Record<string, any>> = { en, zh };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  // FIX: Updated function to handle placeholder replacements.
  const t = (key: string, replacements?: Record<string, string | number>): string => {
    // Simple key navigation, e.g., "nav.dashboard"
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        return key; // Return key if not found
      }
    }
    
    let resultString = String(result || key);

    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            resultString = resultString.replace(`{${placeholder}}`, String(replacements[placeholder]));
        });
    }

    return resultString;
  };

  // FIX: Replaced JSX with React.createElement to support .ts file extension.
  // The original JSX was causing parsing errors because this file is not a .tsx file.
  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t } }, children);
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
