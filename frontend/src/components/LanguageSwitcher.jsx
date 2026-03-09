import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import STORAGE_KEYS from "../utils/storage.js";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleChange = async (event) => {
    const value = event.target.value;
    localStorage.setItem(STORAGE_KEYS.language, value);
    await i18n.changeLanguage(value);
  };

  return (
    <label className="ui-pill text-sm">
      <Languages size={16} />
      <select value={i18n.language} onChange={handleChange} className="bg-transparent outline-none">
        <option className="bg-slate-900" value="en">
          EN
        </option>
        <option className="bg-slate-900" value="ru">
          RU
        </option>
        <option className="bg-slate-900" value="uz">
          UZ
        </option>
      </select>
    </label>
  );
};

export default LanguageSwitcher;
