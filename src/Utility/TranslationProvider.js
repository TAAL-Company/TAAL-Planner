import React, { createContext, useState, useContext } from 'react';

const TranslationContext = createContext();

export const TranslationProvider = ({ children, defaultLang = 'en' }) => {
  const [currentLanguage, setCurrentLanguage] = useState(defaultLang);

  const translate = async (text, targetLang = currentLanguage) => {
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
  };

  const translateText = async (text, targetLang) => {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
          text
        )}`
      );

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      return data[0][0][0];
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  return (
    <TranslationContext.Provider
      value={{ translate, currentLanguage, setLanguage: setCurrentLanguage }}
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
