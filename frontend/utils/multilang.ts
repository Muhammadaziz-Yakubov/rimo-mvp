import { MultiLang } from "../types/api.types";

export function getTranslation(
  multilang?: MultiLang,
  locale: "uz" | "ru" | "en" | "kaa" = "uz"
): string {
  if (!multilang) return "";
  
  // Try selected locale
  if (multilang[locale]) return multilang[locale]!;
  
  // Try standard Uzbek fallback
  if (multilang.uz) return multilang.uz;
  
  // Try Russian fallback
  if (multilang.ru) return multilang.ru;
  
  // Try English fallback
  if (multilang.en) return multilang.en;
  
  // Try Karakalpak fallback
  if (multilang.kaa) return multilang.kaa;
  
  // Return first available key or empty string
  const values = Object.values(multilang);
  return values.length > 0 ? values[0]! : "";
}
