import { HacsLogger } from "../tools/hacs-logger";
import { languages } from "./generated";

const warnings: { language: string[]; sting: Record<string, Array<string>> } = {
  language: [],
  sting: {},
};

export function localize(language: string, string: string, replace?: Record<string, any>): string {
  let translated: any;

  const logger = new HacsLogger("localize");

  const split = string.split(".");

  const lang = (language || localStorage.getItem("selectedLanguage") || "en")
    .replace(/['"]+/g, "")
    .replace("-", "_");

  if (!languages[lang] && !warnings.language.includes(lang)) {
    warnings.language.push(lang);
    logger.warn(
      `Language '${lang.replace(
        "_",
        "-"
      )}' is not added to HACS. https://hacs.xyz/docs/developer/translation`
    );
  }

  try {
    translated = languages[lang];
    split.forEach((section) => {
      translated = translated[section];
    });
  } catch (e) {
    if (languages[lang] && !warnings.sting[lang]) {
      warnings.sting[lang] = [];
    }
    if (languages[lang] && !warnings.sting[lang].includes(string)) {
      warnings.sting[lang].push(string);
      logger.warn(
        `Translation string '${string}' for '${lang.replace(
          "_",
          "-"
        )}' is not added to HACS. https://hacs.xyz/docs/developer/translation`
      );
    }

    translated = undefined;
  }

  if (translated === undefined) {
    translated = languages.en;
    split.forEach((section) => {
      translated = translated[section];
    });
  }

  if (replace) {
    const keys = Object.keys(replace);
    for (const key of keys) {
      if (!translated.includes(key)) {
        logger.error(`Variable '${key}' does not exist in '${string}' with '${lang}'`);
        continue;
      }
      translated = translated.replace(`{${key}}`, String(replace[key]));
    }
    if (translated.includes("{") || translated.includes("}")) {
      logger.error(`Translation for '${string}' with '${lang}' is missing variables`);
    }
  }
  return String(translated);
}
