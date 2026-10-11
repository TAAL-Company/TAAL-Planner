import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTranslator } from './TranslationProvider';

/**
 * Returns [translatedItems, isTranslating] for `items` (re-computed when items or the UI language change).
 * `fields` are the top-level string fields to translate; `nested` maps an array-valued
 * property to the string fields to translate inside it, e.g. { tasks: ['title'] }.
 * The original `items` are never mutated.
 */
export default function useTranslatedList(items, fields = [], nested = {}) {
  const { i18n } = useTranslation();
  const { translateArrayOfObjects } = useTranslator();
  const lang = (i18n.language || 'en').split('-')[0];
  const [state, setState] = useState({ items: null, lang: null, result: items });

  useEffect(() => {
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
  }, [items, lang]);

  const isTranslating = state.items !== items || state.lang !== lang;
  return [isTranslating ? items : state.result, isTranslating];
}
