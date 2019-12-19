import * as da from "./languages/da.json";
import * as de from "./languages/de.json";
import * as el from "./languages/el.json";
import * as en from "./languages/en.json";
import * as es from "./languages/es.json";
import * as fr from "./languages/fr.json";
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
import * as zh_Hans from "./languages/zh-Hans.json";

var languages = {
  da: da,
  de: de,
  el: el,
  en: en,
  es: es,
  fr: fr,
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
  zh_Hans: zh_Hans
};

export function localize(
  string: string,
  search: string = undefined,
  replace: string = undefined
) {
  const section = string.split(".")[0];
  const key = string.split(".")[1];

  const lang = (localStorage.getItem("selectedLanguage") || "en")
    .replace(/['"]+/g, "")
    .replace("-", "_");

  var tranlated: string;

  try {
    tranlated = languages[lang][section][key];
  } catch (e) {
    tranlated = languages["en"][section][key];
  }

  if (tranlated === undefined) tranlated = languages["en"][section][key];

  if (search !== undefined && replace !== undefined) {
    tranlated = tranlated.replace(search, replace);
  }
  return tranlated;
}
