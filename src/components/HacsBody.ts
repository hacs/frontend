import {
    CSSResultArray,
    LitElement,
    customElement,
    TemplateResult,
    html,
    css
} from "lit-element";

import { HacsStyle } from "../style/hacs-style"

@customElement("hacs-body")
export class HacsBody extends LitElement {

    protected render(): TemplateResult | void {
        return html`
        <div class="hacs-body">
            <slot></slot>
        </div>
        `
    }

    static get styles(): CSSResultArray {
        return [
            HacsStyle,
            css`
            .hacs-body {

                width: 95%;
                margin-left: 2.5%;
                margin-top: 2.5%;
                margin-bottom: 2.5%;
            }
            `]
    }
}