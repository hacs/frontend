import IntlMessageFormat from "intl-messageformat";
import { HacsLogger } from "../tools/hacs-logger";
import { languages } from "./generated";

const DEFAULT_LANGUAGE = "en";
const IGNORE_LANGUAGES = new Set(["en_GB"]);
const logger = new HacsLogger("localize");

const _localizationCache = {};

export function localize(language: string, string: string, replace?: Record<string, any>): string {
  try {
    return _localize(language, string, replace);
  } catch (err: any) {
    logger.error(err?.message || `Unknown error translating '${string}' with '${language}'`);
    return _localize(DEFAULT_LANGUAGE, string, replace);
  }
}

function _localize(language: string, string: string, replace?: Record<string, any>): string {
  let lang = (language || window?.localStorage?.getItem("selectedLanguage") || DEFAULT_LANGUAGE)
    .replace(/['"]+/g, "")
    .replace("-", "_");

  if (!languages[lang] || IGNORE_LANGUAGES.has(lang)) {
    lang = DEFAULT_LANGUAGE;
  }

  const translatedValue = languages[lang]?.[string] || languages[DEFAULT_LANGUAGE][string];

  if (!translatedValue) {
    if (lang !== DEFAULT_LANGUAGE) {
      throw Error(`'${string}' is unknown'`);
    }
    return string;
  }

  const messageKey = `${string}_${translatedValue}`;

  let translatedMessage = _localizationCache[messageKey] as IntlMessageFormat | undefined;

  if (!translatedMessage) {
    try {
      translatedMessage = new IntlMessageFormat(translatedValue, lang);
    } catch (err: any) {
      if (lang !== DEFAULT_LANGUAGE) {
        throw Error(`Translation problem with '${string}' for '${lang}'`);
      }
      return string;
    }
    _localizationCache[messageKey] = translatedMessage;
  }

  try {
    return translatedMessage.format<string>(replace) as string;
  } catch (err: any) {
    if (lang !== DEFAULT_LANGUAGE) {
      throw Error(`Translation problem with placeholders for '${string}' for '${lang}'`);
    }
    return string;
  }
}
