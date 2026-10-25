import { createPreferences } from './preferences';
import { createTranslator } from './translator';
import type { Services } from './types';

export type { PreferencesService, Services, TranslatorService } from './types';

export const createServices = (): Services => ({
  preferences: createPreferences(),
  translator: createTranslator(),
  browserLanguages: navigator.languages.length > 0 ? navigator.languages : [navigator.language],
});
