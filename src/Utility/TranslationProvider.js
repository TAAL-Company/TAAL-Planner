import React, { createContext, useState, useContext, useRef, useCallback } from 'react';

const TranslationContext = createContext();

// Batch size for translation requests (Google has URL length limits)
const BATCH_SIZE = 50;
// Delay between batch requests to avoid rate limiting
const BATCH_DELAY = 100;

export const TranslationProvider = ({ children, defaultLang = 'en' }) => {
  const [currentLanguage, setCurrentLanguage] = useState(defaultLang);
  
  // Translation cache: { 'en->he': { 'hello': 'שלום' } }
  const cacheRef = useRef({});

  // Get cache key for language pair
  const getCacheKey = (targetLang) => `auto->${targetLang}`;

  // Get cached translation
  const getCached = (text, targetLang) => {
    const cacheKey = getCacheKey(targetLang);
    return cacheRef.current[cacheKey]?.[text];
  };

  // Set cached translation
  const setCache = (text, translated, targetLang) => {
    const cacheKey = getCacheKey(targetLang);
    if (!cacheRef.current[cacheKey]) {
      cacheRef.current[cacheKey] = {};
    }
    cacheRef.current[cacheKey][text] = translated;
  };

  // Clear cache (useful when changing source language)
  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  // Translate a single text string
  const translateText = useCallback(async (text, targetLang) => {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return text;
    }

    // Check cache first
    const cached = getCached(text, targetLang);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      // Handle multi-sentence responses
      const translated = data[0].map(item => item[0]).join('');
      
      // Cache the result
      setCache(text, translated, targetLang);
      
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }, []);

  // Translate multiple texts in batch (reduces API calls)
  const translateBatch = useCallback(async (texts, targetLang) => {
    if (!texts || texts.length === 0) return [];

    const results = new Array(texts.length);
    const toTranslate = []; // { index, text }

    // Check cache and collect texts that need translation
    texts.forEach((text, index) => {
      if (!text || typeof text !== 'string' || text.trim() === '') {
        results[index] = text;
        return;
      }

      const cached = getCached(text, targetLang);
      if (cached) {
        results[index] = cached;
      } else {
        toTranslate.push({ index, text });
      }
    });

    // If everything was cached, return early
    if (toTranslate.length === 0) {
      return results;
    }

    // Process in batches to avoid URL length limits
    for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
      const batch = toTranslate.slice(i, i + BATCH_SIZE);
      
      // Use a separator that's unlikely to appear in text
      const separator = ' ||| ';
      const combinedText = batch.map(item => item.text).join(separator);

      try {
        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(combinedText)}`
        );

        if (!response.ok) throw new Error('Batch translation failed');

        const data = await response.json();
        const translatedCombined = data[0].map(item => item[0]).join('');
        const translatedParts = translatedCombined.split(/\s*\|\|\|\s*/);

        // Map translations back to results
        batch.forEach((item, batchIndex) => {
          const translated = translatedParts[batchIndex] || item.text;
          results[item.index] = translated;
          setCache(item.text, translated, targetLang);
        });

      } catch (error) {
        console.error('Batch translation error:', error);
        // Fallback: keep original texts
        batch.forEach(item => {
          results[item.index] = item.text;
        });
      }

      // Add delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < toTranslate.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    return results;
  }, []);

  // Translate a single string
  const translate = useCallback(async (text, targetLang = currentLanguage) => {
    if (React.isValidElement(text)) {
      return React.cloneElement(text, {
        children: await Promise.all(
          React.Children.map(text.props.children, async child => {
            if (typeof child === 'string') {
              return await translateText(child, targetLang);
            }
            if (React.isValidElement(child)) {
              return await translate(child, targetLang);
            }
            return child;
          }) || []
        ),
      });
    }

    if (typeof text === 'string') {
      return await translateText(text, targetLang);
    }

    return text;
  }, [currentLanguage, translateText]);

  // Translate specific fields of a single object
  const translateObject = useCallback(async (obj, targetLang = currentLanguage, fields = []) => {
    if (!obj || typeof obj !== 'object') return obj;

    const translatedObj = { ...obj };
    const textsToTranslate = [];
    const fieldMap = [];

    // Collect all texts that need translation
    fields.forEach(field => {
      const value = obj[field];
      if (value && typeof value === 'string') {
        textsToTranslate.push(value);
        fieldMap.push(field);
      }
    });

    if (textsToTranslate.length === 0) return translatedObj;

    // Translate all texts in batch
    const translatedTexts = await translateBatch(textsToTranslate, targetLang);

    // Map translations back to object
    fieldMap.forEach((field, index) => {
      translatedObj[field] = translatedTexts[index];
    });

    return translatedObj;
  }, [currentLanguage, translateBatch]);

  // Translate an array of objects (efficiently batches all texts)
  const translateArrayOfObjects = useCallback(async (
    array, 
    targetLang = currentLanguage, 
    fields = []
  ) => {
    if (!array || !Array.isArray(array) || array.length === 0) {
      return array;
    }

    // Collect all texts from all objects
    const allTexts = [];
    const textMap = []; // { arrayIndex, field }

    array.forEach((obj, arrayIndex) => {
      if (!obj || typeof obj !== 'object') return;

      fields.forEach(field => {
        const value = obj[field];
        if (value && typeof value === 'string') {
          allTexts.push(value);
          textMap.push({ arrayIndex, field });
        }
      });
    });

    if (allTexts.length === 0) return array;

    // Translate all texts in batch
    const translatedTexts = await translateBatch(allTexts, targetLang);

    // Create translated array with new objects
    const translatedArray = array.map(obj => ({ ...obj }));

    // Map translations back to objects
    textMap.forEach((mapping, index) => {
      translatedArray[mapping.arrayIndex][mapping.field] = translatedTexts[index];
    });

    return translatedArray;
  }, [currentLanguage, translateBatch]);

  // Translate an array of objects all with non-specific fields
  const translateArrayOfObjectsfull = useCallback(async (
    array, 
    targetLang = currentLanguage
  ) => {
    if (!array || !Array.isArray(array) || array.length === 0) {
      return array;
    }
    // Collect all texts from all objects
    const allTexts = [];
    const textMap = []; // { arrayIndex, field }
    array.forEach((obj, arrayIndex) => {
      if (!obj || typeof obj !== 'object') return;
      Object.keys(obj).forEach(field => {
        const value = obj[field];
        if (value && typeof value === 'string') {
          allTexts.push(value);
          textMap.push({ arrayIndex, field });
        }
      });
    });

    if (allTexts.length === 0) return array;
    // Translate all texts in batch
    const translatedTexts = await translateBatch(allTexts, targetLang);
    // Create translated array with new objects
    const translatedArray = array.map(obj => ({ ...obj }));
    // Map translations back to objects
    textMap.forEach((mapping, index) => {
      translatedArray[mapping.arrayIndex][mapping.field] = translatedTexts[index];
    });
    return translatedArray;
  }, [currentLanguage, translateBatch]);


  // Alias for backwards compatibility
  const translateObjectInBatch = translateArrayOfObjects;
  const translateObjectOneByOne = translateObject;

  return (
    <TranslationContext.Provider
      value={{ 
        translate, 
        translateText,
        translateBatch,
        translateObject,
        translateArrayOfObjects,
        translateObjectInBatch,
        translateObjectOneByOne,
        clearCache,
        currentLanguage, 
        setLanguage: setCurrentLanguage,
        translateArrayOfObjectsfull,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslator = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslator must be used within a TranslationProvider');
  }
  return context;
};
