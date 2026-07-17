import { create } from "zustand";

export type LanguageType = "uz" | "uz-cyr" | "en" | "ru";

interface LanguageState {
  lang: LanguageType;
  setLanguage: (lang: LanguageType) => void;
}

const getInitialLanguage = (): LanguageType => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("rimo-language") as LanguageType;
    if (["uz", "uz-cyr", "en", "ru"].includes(saved)) return saved;
  }
  return "uz";
};

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: getInitialLanguage(),
  setLanguage: (lang) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rimo-language", lang);
    }
    set({ lang });
  },
}));
