// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Define language resources
const resources = {
    English: {
      translation: {
        Direction: "ltr",
        showNotification:{
          "Error_delete_user": "Error deleting user",
          "Success_delete_user": "User deleted successfully",
          "Error_duplicate_user": "Error duplicating user",
          "Success_duplicate_user": "User duplicated successfully",
          "Error_edit_user": "Error editing user",
          "Success_edit_user": "User edited successfully",
          "Error_add_user": "Error adding user",
          "Success_add_user": "User added successfully",
        },
        UserPage: {
          "Avatar": "Avatar",
          "Name": "Name",
          "Username": "Username",
          "Email": "Email",
          "Phone": "Phone",
          "Role": "Role",
          "cognitive_profile": "Cognitive Profile",
          "CoachName": "Coach Name",
          "SitesName": "Sites",
          "CreatedAt": "Created At",
          'LastLoginAt': 'Last Login At',
          "Online": "Online",
          "RouteName": "Route Name",
          "RouteOnlyOnce": "Only Once",
          "ADDANewEmployee": "ADD A New Employee",
          "Edit": "Edit",
          "Delete": "Delete",
          "Duplicate": "Duplicate",
        },
        Forms: {
          "Name": "Name",
          "Username": "Username",
          "Email": "Email",
          "Phone": "Phone",
          "Role": "Role",
          "Select_Coach": "Select Coach",
          "Select_Sites": "Select Sites",
          "Password": "Password",
          "Submit": "Submit",
          "Cancel": "Cancel",
        },
        FormsErrors: {
          "NameRequired": "Name is required",
          "UsernameRequired": "Username is required",
          "PasswordRequired": "Password is required",
          "EmailRequired": "Email is required",
          "EmailFormat": "Invalid email format",
        }
      },
    },
    Hebrew: {
      translation: {
        Direction: "rtl",
        showNotification: {
          "Error_delete_user": "שגיאה במחיקת משתמש",
          "Success_delete_user": "המשתמש נמחק בהצלחה",
          "Error_duplicate_user": "שגיאה בשכפול משתמש",
          "Success_duplicate_user": "המשתמש שוכפל בהצלחה",
          "Error_edit_user": "שגיאה בעריכת משתמש",
          "Success_edit_user": "המשתמש נערך בהצלחה",
          "Error_add_user": "שגיאה בהוספת משתמש",
          "Success_add_user": "המשתמש נוסף בהצלחה",
        },
        UserPage: {
          "Avatar": "תמונה",
          "Name": "שם",
          "Username": "שם משתמש",
          "Email": "מייל",
          "Phone": "טלפון",
          "Role": "פרטי",
          "cognitive_profile": "פרופיל ידע",
          "CoachName": "שם מדריך",
          "SitesName": "אתרים",
          "CreatedAt": "נוצר ב",
          'LastLoginAt': 'התחבר לאחרונה ב',
          "Online": "מחובר",
          "RouteName": "שם רחוב",
          "RouteOnlyOnce": "רק פעם אחת",
          "ADDANewEmployee": "הוסף עובד חדש",
          "Edit": "ערוך",
          "Delete": "מחק",
          "Duplicate": "העתק",
        },
        Forms: {
          "Name": "שם",
          "Username": "שם משתמש",
          "Email": "מייל",
          "Phone": "טלפון",
          "Role": "פרטי",
          "Select_Coach": "בחר מדריך",
          "Select_Sites": "בחר אתרים",
          "Password": "סיסמה",
          "Submit": "שלח",
          "Cancel": "ביטול",
        },
        FormsErrors: {
          "NameRequired": "שם חובה",
          "UsernameRequired": "שם משתמש חובה",
          "PasswordRequired": "סיסמה חובה",
          "EmailRequired": "מייל חובה",
          "EmailFormat": "פורמט מייל לא תקין",
        }
      }
    }
  };

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: sessionStorage.getItem('language') || 'en', // Set the language from sessionStorage or default to 'en'
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes strings
    },
  });

export default i18n;
