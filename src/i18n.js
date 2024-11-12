// // i18n.js
// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
// import languageDetector from 'i18next-browser-languagedetector'; // Detect language from sessionStorage

// // Define language resources
// const resources = {
//     en: {
//       translation: {
//         "Username": "Username",
//         "Email": "Email",
//         "Name": "Name",
//         "Phone": "Phone",
//         "Role": "Role",
//         "Cognitive Profile": "Cognitive Profile",
//         "Coach Name": "Coach Name",
//         "Online": "Online",
//         "Route Name": "Route Name",
//         "Only Once": "Only Once",
//         "Error": "An error occurred. Please try again later.",
//       }
//     },
//     he: {
//       translation: {
//         "Username": "שם משתמש",
//         "Email": "דוא\"ל",
//         "Name": "שם",
//         "Phone": "טלפון",
//         "Role": "תפקיד",
//         "Cognitive Profile": "פרופיל קוגניטיבי",
//         "Coach Name": "שם מאמן",
//         "Online": "זמין",
//         "Route Name": "שם מסלול",
//         "Only Once": "רק פעם אחת",
//         "Error": "אירעה שגיאה. אנא נסה שוב מאוחר יותר.",
//       }
//     }
//   };

// i18n
//   .use(languageDetector)
//   .use(initReactI18next)
//   .init({
//     resources,
//     lng: sessionStorage.getItem('language') || 'en', // Set the language from sessionStorage or default to 'en'
//     fallbackLng: 'en',
//     interpolation: {
//       escapeValue: false, // React already escapes strings
//     },
//   });

// export default i18n;
