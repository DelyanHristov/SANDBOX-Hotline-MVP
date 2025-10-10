import { useEffect, useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { en, ar, type Translations, type Language } from "./types";

export const useI18n = () => {
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const translations: Translations = useMemo(
    () => (language === "ar" ? ar : en),
    [language]
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }
  }, [language]);

  return {
    t: translations,
    language,
    setLanguage,
    direction: language === "ar" ? "rtl" : "ltr"
  } as const;
};

export type { Language, Translations };
