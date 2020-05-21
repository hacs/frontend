import * as da from "./languages/da.json";
import * as de from "./languages/de.json";
import * as el from "./languages/el.json";
import * as en from "./languages/en.json";
import * as es from "./languages/es.json";
import * as fr from "./languages/fr.json";
import * as hu from "./languages/hu.json";
import * as it from "./languages/it.json";
import * as nb from "./languages/nb.json";
import * as nl from "./languages/nl.json";
import * as nn from "./languages/nn.json";
import * as pl from "./languages/pl.json";
import * as pt_BR from "./languages/pt-BR.json";
import * as ro from "./languages/ro.json";
import * as ru from "./languages/ru.json";
import * as sl from "./languages/sl.json";
import * as sv from "./languages/sv.json";
import * as vi from "./languages/vi.json";
import * as zh_Hans from "./languages/zh-Hans.json";

export function localize(
  string: string,
  search: string = undefined,
  replace: string = undefined
) {
  const languages = {
    da: da,
    de: de,
    el: el,
    en: en,
    es: es,
    fr: fr,
    hu: hu,
    it: it,
    nb: nb,
    nl: nl,
    nn: nn,
    pl: pl,
    pt_BR: pt_BR,
    ro: ro,
    ru: ru,
    sl: sl,
    sv: sv,
    vi: vi,
    zh_Hans: zh_Hans,
  };

  let translated: any;

  const split = string.split(".");

  const lang = (localStorage.getItem("selectedLanguage") || "en")
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
