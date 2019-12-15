import * as en from './languages/en.json';
import * as no from './languages/no.json';

var languages = { no: no, en: en };

export function localize(string: string, search: string = undefined, replace: string = undefined) {

    const section = string.split(".")[0]
    const key = string.split(".")[1]

    const lang = (localStorage.getItem("selectedLanguage") || "en").replace(/['"]+/g, '');

    console.debug(`Using ${lang}`)

    var tranlated: string;

    try {
        tranlated = languages[lang][section][key]
    } catch (e) {
        tranlated = languages["en"][section][key]
    }

    if (search !== undefined && replace !== undefined) {
        tranlated = tranlated.replace(search, replace)
    }
    return tranlated;
}