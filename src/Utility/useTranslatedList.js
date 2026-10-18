import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTranslator } from './TranslationProvider';

const LANGUAGE_CODES = {
  hebrew: 'iw',
  english: 'en',
  arabic: 'ar',
  russian: 'ru',
  german: 'de',
  he: 'iw',
  en: 'en',
  ar: 'ar',
  ru: 'ru',
  de: 'de',
};

// i18n.language holds names such as 'Hebrew'; Google Translate needs a language code
const toLanguageCode = (language) => {
  const key = (language || 'en').toLowerCase().split('-')[0];
  return LANGUAGE_CODES[key] || key;
};

/**
 * Returns [translatedItems, isTranslating] for `items` (re-computed when items or the UI language change).
 * `fields` are the top-level string fields to translate; `nested` maps an array-valued
 * property to the string fields to translate inside it, e.g. { tasks: ['title'] }.
 * The original `items` are never mutated.
 */
export default function useTranslatedList(items, fields = [], nested = {}) {
  const { i18n } = useTranslation();
  const { translateArrayOfObjects, translationEnabled } = useTranslator();
  const lang = toLanguageCode(i18n.language);
  const [state, setState] = useState({ items: null, lang: null, result: items });

  useEffect(() => {
    if (!translationEnabled) return undefined;
    let cancelled = false;
    const run = async () => {
      let result = items;
      try {
        const top = await translateArrayOfObjects(items, lang, fields);
        result = await Promise.all(
          top.map(async (item) => {
            const copy = { ...item };
            await Promise.all(
              Object.entries(nested).map(async ([key, nestedFields]) => {
                if (Array.isArray(item?.[key])) {
                  copy[key] = await translateArrayOfObjects(item[key], lang, nestedFields);
                }
              })
            );
            return copy;
          })
        );
      } catch (error) {
        console.error(error);
      }
      if (!cancelled) setState({ items, lang, result });
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, lang, translationEnabled]);

  if (!translationEnabled) return [items, false];
  const isTranslating = state.items !== items || state.lang !== lang;
  return [isTranslating ? items : state.result, isTranslating];
}
