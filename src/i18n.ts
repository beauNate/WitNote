/**
 * i18n Configuration
 * English only
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

// Language resources
const resources = {
    en: { translation: en }
};

export type LanguageCode = 'en';

i18n
    // Pass i18n to react-i18next
    .use(initReactI18next)
    // Initialize i18next
    .init({
        resources,
        lng: 'en', // Force English
        fallbackLng: 'en',
        supportedLngs: ['en'],

        interpolation: {
            escapeValue: false // React already safely handles this
        }
    });

export default i18n;

// Tool function to change language (kept for compatibility but does nothing or just ensures 'en')
export const changeLanguage = (lang: LanguageCode) => {
    if (lang !== 'en') return;
    i18n.changeLanguage(lang);
};

// Get current language
export const getCurrentLanguage = (): string => {
    return 'en';
};