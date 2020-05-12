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

  let subsection: string;
  let section: string;
  let key: string;

  let translated: string;

  const split = string.split(".");

  if (split.length === 3) {
    section = split[0];
    subsection = split[1];
    key = split[2];
  } else {
    section = split[0];
    key = split[1];
  }

  const lang = (localStorage.getItem("selectedLanguage") || "en")
    .replace(/['"]+/g, "")
    .replace("-", "_");

  try {
    if (subsection !== undefined) {
      translated = languages[lang][section][subsection][key];
    } else {
      translated = languages[lang][section][key];
    }
  } catch (e) {
    if (subsection !== undefined) {
      translated = languages["en"][section][subsection][key];
    } else {
      translated = languages["en"][section][key];
    }
  }

  if (translated === undefined) {
    if (subsection !== undefined) {
      translated = languages["en"][section][subsection][key];
    } else {
      translated = languages["en"][section][key];
    }
  }

  if (search !== undefined && replace !== undefined) {
    translated = translated.replace(search, replace);
  }
  return translated;
}
