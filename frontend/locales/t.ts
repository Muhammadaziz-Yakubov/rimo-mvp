import uz from "./uz.json";
import uzCyr from "./uz-cyr.json";
import en from "./en.json";
import ru from "./ru.json";
import { useLanguageStore } from "@/store/language.store";

const dictionaries = {
  uz,
  "uz-cyr": uzCyr,
  en,
  ru,
};

export function t(key: string, replace?: Record<string, string>): string {
  let lang = "uz";
  try {
    lang = useLanguageStore.getState().lang || "uz";
  } catch (_) {
    // Fail-safe default
  }

  const dictionary = dictionaries[lang as keyof typeof dictionaries] || uz;
  const keys = key.split(".");
  let result: any = dictionary;

  for (const k of keys) {
    if (result && typeof result === "object" && k in result) {
      result = result[k];
    } else {
      // Fallback to default Uzbek Latin dictionary
      let fallbackResult: any = uz;
      let ok = true;
      for (const fk of keys) {
        if (fallbackResult && typeof fallbackResult === "object" && fk in fallbackResult) {
          fallbackResult = fallbackResult[fk];
        } else {
          ok = false;
          break;
        }
      }
      if (ok && typeof fallbackResult === "string") {
        result = fallbackResult;
      } else {
        return key;
      }
      break;
    }
  }

  if (typeof result !== "string") {
    return key;
  }

  if (replace) {
    let replaced = result;
    for (const [k, v] of Object.entries(replace)) {
      replaced = replaced.replace(new RegExp(`{${k}}`, "g"), v);
    }
    return replaced;
  }

  return result;
}
