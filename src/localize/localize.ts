import * as en from './languages/en.json';
import * as no from './languages/no.json';

var languages = { no: no, en: en };

export function localize(string: string) {

    const section = string.split(".")[0]
    const key = string.split(".")[1]

    const lang = (localStorage.getItem("selectedLanguage") || "en").replace(/['"]+/g, '');

    console.debug(`Using ${lang}`)

    try {
        return languages[lang][section][key]
    } catch (e) {
        return languages["en"][section][key]
    }
}