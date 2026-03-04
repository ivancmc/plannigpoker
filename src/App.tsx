import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { Moon, Sun, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import Home from "./pages/Home";
import Room from "./pages/Room";

export default function App() {
  const { t, i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("poker_theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("poker_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("poker_theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "pt" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-4 px-6 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
            <svg
              viewBox="0 0 32 32"
              className="w-8 h-8 fill-indigo-600 dark:fill-indigo-400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="4" y="2" width="24" height="28" rx="4" />
              <rect x="7" y="5" width="18" height="22" rx="2" fill="white" fillOpacity="0.2" />
              <circle cx="16" cy="16" r="4" fill="white" />
              <path d="M14 13L19 16L14 19V13Z" className="fill-indigo-600 dark:fill-indigo-400" />
              <circle cx="8" cy="6" r="1.5" fill="white" />
              <circle cx="24" cy="26" r="1.5" fill="white" />
            </svg>
            {t("app_title")}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
              title={t("toggle_language")}
            >
              <Globe size={20} />
              {i18n.language === "en" ? "EN" : "PT"}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={t("toggle_theme")}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
