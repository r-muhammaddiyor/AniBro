import { Moon, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";
import STORAGE_KEYS from "../utils/storage.js";

const DarkModeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem(STORAGE_KEYS.theme) || "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme((current) => (current === "dark" ? "midnight" : "dark"))}
      className="ui-pill text-sm"
      aria-label="Theme toggle"
    >
      {isDark ? <Moon size={16} /> : <SunMedium size={16} />}
      {isDark ? "Dark" : "Midnight"}
    </button>
  );
};

export default DarkModeToggle;
