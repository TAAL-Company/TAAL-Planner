// // FormsPage i18n - Re-exports from main i18n.js
// import i18n from '../../i18n';

// // Language mapping from main i18n (English/Hebrew) to forms i18n (en/he)
// const languageMap = {
//   'English': 'en',
//   'Hebrew': 'he',
//   'Arabic': 'ar',
//   'Russian': 'ru',
//   'en': 'en',
//   'he': 'he',
//   'ar': 'ar',
//   'ru': 'ru'
// };

// // Helper function to get translations from main i18n FormsPage section
// export const getTranslation = (key, language = 'he', replacements = {}) => {
//   // Map language code to main i18n language name
//   const langMap = {
//     'he': 'Hebrew',
//     'en': 'English',
//     'ar': 'Arabic',
//     'ru': 'Russian',
//     'Hebrew': 'Hebrew',
//     'English': 'English',
//     'Arabic': 'Arabic',
//     'Russian': 'Russian'
//   };
  
//   const mainLang = langMap[language] || 'Hebrew';
//   const resources = i18n.options.resources;
  
//   let text = resources?.[mainLang]?.translation?.FormsPage?.[key] || key;
  
//   // Replace placeholders like {groupName}
//   Object.keys(replacements).forEach(placeholder => {
//     text = text.replace(`{${placeholder}}`, replacements[placeholder]);
//   });
  
//   return text;
// };

// // Build formsTranslations object from main i18n for backwards compatibility
// const buildFormsTranslations = () => {
//   const resources = i18n.options.resources;
//   return {
//     he: resources?.Hebrew?.translation?.FormsPage || {},
//     en: resources?.English?.translation?.FormsPage || {},
//     ar: resources?.Arabic?.translation?.FormsPage || {},
//     ru: resources?.Russian?.translation?.FormsPage || {}
//   };
// };

// export const formsTranslations = buildFormsTranslations();

// export default formsTranslations;
