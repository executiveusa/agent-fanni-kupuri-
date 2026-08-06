import { useState, createContext, useContext } from 'react';
import { en } from '../i18n/en.js';
import { es } from '../i18n/es.js';

const langs = { en, es };

export const LanguageContext = createContext({ lang: 'en', t: en, toggle: () => {} });

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useLanguageProvider() {
  const [lang, setLang] = useState(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('fanni.lang') : null;
    return stored === 'es' ? 'es' : 'en';
  });

  const toggle = () => {
    setLang(prev => {
      const next = prev === 'en' ? 'es' : 'en';
      if (typeof localStorage !== 'undefined') localStorage.setItem('fanni.lang', next);
      return next;
    });
  };

  return { lang, t: langs[lang], toggle };
}
