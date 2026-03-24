'use client';
import { createContext, useContext, ReactNode } from 'react';

type I18nContextType = {
  locale: string;
  t: Record<string, unknown>; // The dictionary object
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ 
  children, 
  locale, 
  dictionary 
}: { 
  children: ReactNode; 
  locale: string; 
  dictionary: Record<string, unknown>; 
}) {
  return (
    <I18nContext.Provider value={{ locale, t: dictionary }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
