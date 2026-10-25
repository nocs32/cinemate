import type { Language, TranslationKey, TranslationValues } from '../i18n';

// This browser's own settings, kept in localStorage.
export interface PreferencesService {
  loadLanguage: () => Language | null;
  saveLanguage: (language: Language) => void;
}

export interface TranslatorService {
  translate: (language: Language, key: TranslationKey, values?: TranslationValues) => string;
  formatTime: (language: Language, at: number) => string;
}

// Everything stores need from the outside world, created once in index.tsx.
export interface Services {
  preferences: PreferencesService;
  translator: TranslatorService;
  // The browser's languages, most preferred first (navigator.languages).
  browserLanguages: readonly string[];
}
