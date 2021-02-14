import { languages } from "./generated";

const warnings = { language: [], sting: {} };

export function localize(
  language: string,
  string: string,
  search: string = undefined,
  replace: string = undefined
) {
  let translated: any;

  const split = string.split(".");

  const lang = (language || localStorage.getItem("selectedLanguage") || "en")
    .replace(/['"]+/g, "")
    .replace("-", "_");

  if (!languages[lang] && !warnings.language.includes(lang)) {
    warnings.language.push(lang);
    console.warn(
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
      console.warn(
        `Translation string '${string}' for '${lang.replace(
          "_",
          "-"
        )}' is not added to HACS. https://hacs.xyz/docs/developer/translation`
      );
    }

    translated = languages["en"];
    split.forEach((section) => {
      translated = translated[section];
    });
  }

  if (translated === undefined) {
    translated = languages["en"];
    split.forEach((section) => {
      translated = translated[section];
    });
  }

  if (search !== undefined && replace !== undefined) {
    translated = translated.replace(search, replace);
  }
  return translated;
}
