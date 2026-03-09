import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ru from "./locales/ru.json";
import uz from "./locales/uz.json";
import STORAGE_KEYS from "../utils/storage.js";

const savedLanguage = localStorage.getItem(STORAGE_KEYS.language) || "en";

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    uz: { translation: uz }
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
