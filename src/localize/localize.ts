import { languages } from "./generated";

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

  try {
    translated = languages[lang];
    split.forEach((section) => {
      translated = translated[section];
    });
  } catch (e) {
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
