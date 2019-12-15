import {
    CSSResultArray,
    customElement,
    TemplateResult,
    html,
    css
} from "lit-element";

import { HacsStoreBase } from '../panels/store'
import { HacsStyle } from "../style/hacs-style"

@customElement("hacs-integration_store")
export class HacsInstegrationStore extends HacsStoreBase {

    static get styles(): CSSResultArray {
        return [
            HacsStyle,
            css`

            `]
    }
}