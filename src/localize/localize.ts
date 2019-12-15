const languages = {}

import * as en from './languages/en.json';
languages["en"] = en
import * as no from './languages/no.json';
languages["no"] = no

export function localize(source: string, string: string) {

    const section = string.split(".")[0]
    const key = string.split(".")[0]

    try {
        return languages[source][section][key]
    } catch (error) {
        return languages["en"][section][key]
    }
}