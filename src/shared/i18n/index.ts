import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LOCALE, STORAGE_KEYS } from "@/shared/config/constants";
import ruCommon from "@/shared/i18n/resources/ru/common.json";
import ruAuth from "@/shared/i18n/resources/ru/auth.json";
import ruHome from "@/shared/i18n/resources/ru/home.json";
import ruCourses from "@/shared/i18n/resources/ru/courses.json";
import ruProfile from "@/shared/i18n/resources/ru/profile.json";
import ruMiniApps from "@/shared/i18n/resources/ru/mini-apps.json";
import uzCommon from "@/shared/i18n/resources/uz/common.json";
import uzAuth from "@/shared/i18n/resources/uz/auth.json";
import uzHome from "@/shared/i18n/resources/uz/home.json";
import uzCourses from "@/shared/i18n/resources/uz/courses.json";
import uzProfile from "@/shared/i18n/resources/uz/profile.json";
import uzMiniApps from "@/shared/i18n/resources/uz/mini-apps.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: ["ru", "uz"],
    ns: ["common", "auth", "home", "courses", "profile", "mini-apps"],
    defaultNS: "common",
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: STORAGE_KEYS.locale,
    },
    interpolation: {
      escapeValue: false,
    },
    resources: {
      ru: {
        common: ruCommon,
        auth: ruAuth,
        home: ruHome,
        courses: ruCourses,
        profile: ruProfile,
        "mini-apps": ruMiniApps,
      },
      uz: {
        common: uzCommon,
        auth: uzAuth,
        home: uzHome,
        courses: uzCourses,
        profile: uzProfile,
        "mini-apps": uzMiniApps,
      },
    },
  });

export { i18n };
