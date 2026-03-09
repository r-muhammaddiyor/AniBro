import { Moon, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";
import STORAGE_KEYS from "../utils/storage.js";

const DarkModeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem(STORAGE_KEYS.theme) || "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  const isClassic = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme((current) => (current === "dark" ? "midnight" : "dark"))}
      className="ui-pill text-sm transition hover:bg-white/10 focus-visible:outline-none"
      aria-label="Theme toggle"
      title={isClassic ? "Switch to Midnight theme" : "Switch to Classic theme"}
    >
      {isClassic ? <Moon size={16} /> : <SunMedium size={16} />}
      {isClassic ? "Classic" : "Midnight"}
    </button>
  );
};

export default DarkModeToggle;
