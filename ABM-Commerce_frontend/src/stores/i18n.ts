import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "ar";

interface I18nState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (en: string, ar: string) => string;
  dir: () => "ltr" | "rtl";
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: "en",
      setLocale: (locale) => {
        set({ locale });
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
          document.documentElement.setAttribute("lang", locale);
        }
      },
      t: (en, ar) => (get().locale === "ar" ? ar : en),
      dir: () => (get().locale === "ar" ? "rtl" : "ltr"),
    }),
    { name: "abm.i18n" },
  ),
);
