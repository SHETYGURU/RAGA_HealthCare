import { useAppStore } from '../store/useAppStore';
import { translations } from '../i18n/translations';

type LanguageCode = keyof typeof translations;
type TranslationKey = keyof typeof translations['en'];

export const useTranslation = () => {
  const { language } = useAppStore();

  const t = (key: TranslationKey | string): string => {
    const langDict = translations[language as LanguageCode] || translations['en'];
    // Fallback to English if key doesn't exist in the target language
    const text = (langDict as any)[key] || translations['en'][key as TranslationKey];
    return text || key; // Fallback to the key itself if no translation found
  };

  return { t, language };
};
