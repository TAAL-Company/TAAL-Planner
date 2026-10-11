// Maps translated text -> original text so the planner can show the original on hover.
let translatedToOriginal = new Map();

export const setOriginalTexts = (pairs) => {
  const map = new Map();
  pairs.forEach(([original, translated, fields]) => {
    if (!Array.isArray(original) || !Array.isArray(translated)) return;
    translated.forEach((item, index) => {
      const orig = original[index];
      if (!item || !orig) return;
      fields.forEach((field) => {
        if (typeof item[field] === 'string' && typeof orig[field] === 'string' && item[field] !== orig[field]) {
          map.set(item[field].trim(), orig[field]);
        }
      });
    });
  });
  translatedToOriginal = map;
};

export const clearOriginalTexts = () => {
  translatedToOriginal = new Map();
};

// Returns the original text for a translated string, or undefined (no tooltip).
export const originalOf = (text) => {
  if (typeof text !== 'string') return undefined;
  const key = text
    .replace('&#8211;', '-')
    .replace('&#8217;', "' ")
    .trim();
  return translatedToOriginal.get(text.trim()) || translatedToOriginal.get(key);
};
