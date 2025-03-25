import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { heIL, arSD, ruRU, enUS } from '@mui/x-data-grid';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';

// Create rtl cache
const cacheRtl = createCache({
  key: 'data-grid-rtl-demo',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create ltr cache
const cacheLtr = createCache({
  key: 'data-grid-ltr-demo',
  stylisPlugins: [prefixer],
});

// Define language resources
const resources = {
  English: {
    translation: {
      Direction: "ltr",
      localeText: enUS,
      cache: cacheLtr,
      showNotification: {
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
        "EditEmployeeInfo": "Edit Employee",
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
        "UploadImageText": "Upload an image",
        "SelectCoachText": "Please select a coach from the dropdown menu",
        "SelectSitesText": "Please select sites from the dropdown menu"
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
      localeText: heIL,
      cache: cacheRtl,
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
        "EditEmployeeInfo": "ערוך עובד",
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
        "UploadImageText": "העלה תמונה",
        "SelectCoachText": "אנא בחר מדריך מהתפריט הנפתח",
        "SelectSitesText": "אנא בחר אתרים מהתפריט הנפתח"
      },
      FormsErrors: {
        "NameRequired": "שם חובה",
        "UsernameRequired": "שם משתמש חובה",
        "PasswordRequired": "סיסמה חובה",
        "EmailRequired": "מייל חובה",
        "EmailFormat": "פורמט מייל לא תקין",
      }
    }
  },
  Arabic: {
    translation: {
      Direction: "rtl",
      localeText: arSD,
      cache: cacheRtl,
      showNotification: {
        "Error_delete_user": "خطأ في حذف المستخدم",
        "Success_delete_user": "تم حذف المستخدم بنجاح",
        "Error_duplicate_user": "خطأ في تكرار المستخدم",
        "Success_duplicate_user": "تم تكرار المستخدم بنجاح",
        "Error_edit_user": "خطأ في تعديل المستخدم",
        "Success_edit_user": "تم تعديل المستخدم بنجاح",
        "Error_add_user": "خطأ في إضافة المستخدم",
        "Success_add_user": "تم إضافة المستخدم بنجاح",
      },
      UserPage: {
        "Avatar": "الصورة الرمزية",
        "Name": "الاسم",
        "Username": "اسم المستخدم",
        "Email": "البريد الإلكتروني",
        "Phone": "الهاتف",
        "Role": "الدور",
        "cognitive_profile": "الملف المعرفي",
        "CoachName": "اسم المدرب",
        "SitesName": "المواقع",
        "CreatedAt": "تاريخ الإنشاء",
        'LastLoginAt': 'آخر تسجيل دخول',
        "Online": "متصل",
        "RouteName": "اسم الطريق",
        "RouteOnlyOnce": "مرة واحدة فقط",
        "ADDANewEmployee": "إضافة موظف جديد",
        "EditEmployeeInfo": "تعديل موظف",
        "Edit": "تعديل",
        "Delete": "حذف",
        "Duplicate": "تكرار",
      },
      Forms: {
        "Name": "الاسم",
        "Username": "اسم المستخدم",
        "Email": "البريد الإلكتروني",
        "Phone": "الهاتف",
        "Role": "الدور",
        "Select_Coach": "اختر المدرب",
        "Select_Sites": "اختر المواقع",
        "Password": "كلمة المرور",
        "Submit": "إرسال",
        "Cancel": "إلغاء",
        "UploadImageText": "تحميل صورة",
        "SelectCoachText": "يرجى اختيار مدرب من القائمة المنسدلة",
        "SelectSitesText": "يرجى اختيار المواقع من القائمة المنسدلة"
      },
      FormsErrors: {
        "NameRequired": "الاسم مطلوب",
        "UsernameRequired": "اسم المستخدم مطلوب",
        "PasswordRequired": "كلمة المرور مطلوبة",
        "EmailRequired": "البريد الإلكتروني مطلوب",
        "EmailFormat": "تنسيق البريد الإلكتروني غير صالح",
      }
    }
  },
  Russian: {
    translation: {
      Direction: "ltr",
      localeText: ruRU,
      cache: cacheLtr,
      showNotification: {
        "Error_delete_user": "Ошибка удаления пользователя",
        "Success_delete_user": "Пользователь успешно удален",
        "Error_duplicate_user": "Ошибка дублирования пользователя",
        "Success_duplicate_user": "Пользователь успешно продублирован",
        "Error_edit_user": "Ошибка редактирования пользователя",
        "Success_edit_user": "Пользователь успешно отредактирован",
        "Error_add_user": "Ошибка добавления пользователя",
        "Success_add_user": "Пользователь успешно добавлен",
      },
      UserPage: {
        "Avatar": "Аватар",
        "Name": "Имя",
        "Username": "Имя пользователя",
        "Email": "Электронная почта",
        "Phone": "Телефон",
        "Role": "Роль",
        "cognitive_profile": "Когнитивный профиль",
        "CoachName": "Имя тренера",
        "SitesName": "Сайты",
        "CreatedAt": "Создано",
        'LastLoginAt': 'Последний вход',
        "Online": "В сети",
        "RouteName": "Название маршрута",
        "RouteOnlyOnce": "Только один раз",
        "ADDANewEmployee": "Добавить нового сотрудника",
        "EditEmployeeInfo": "Редактировать информацию сотрудника",
        "Edit": "Редактировать",
        "Delete": "Удалить",
        "Duplicate": "Дублировать",
      },
      Forms: {
        "Name": "Имя",
        "Username": "Имя пользователя",
        "Email": "Электронная почта",
        "Phone": "Телефон",
        "Role": "Роль",
        "Select_Coach": "Выбрать тренера",
        "Select_Sites": "Выбрать сайты",
        "Password": "Пароль",
        "Submit": "Отправить",
        "Cancel": "Отмена",
        "UploadImageText": "Загрузить изображение",
        "SelectCoachText": "Пожалуйста, выберите тренера из выпадающего меню",
        "SelectSitesText": "Пожалуйста, выберите сайты из выпадающего меню"
      },
      FormsErrors: {
        "NameRequired": "Имя обязательно",
        "UsernameRequired": "Имя пользователя обязательно",
        "PasswordRequired": "Пароль обязателен",
        "EmailRequired": "Электронная почта обязательна",
        "EmailFormat": "Неверный формат электронной почты",
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