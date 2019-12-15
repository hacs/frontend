import {
    LitElement,
    CSSResultArray,
    TemplateResult,
    html,
    customElement,
    css,
    property
} from "lit-element";

import { HacsStyle } from "../style/hacs-style"
import { Repository } from "../types"

import "../components/HacsBody"
import "../components/HacsProgressbar"


@customElement("hacs-store")
export class HacsStoreBase extends LitElement {
    @property() public store!: string;
    @property() public repositories!: Repository[];

    protected render(): TemplateResult | void {
        if (this.repositories === undefined) return html`
            <hacs-progressbar .active=${true}></hacs-progressbar>
        `

        return html`
        <hacs-body>
            <ha-card .header=${this.store.toUpperCase()}>
            </ha-card>
        </hacs-body>
        `
    }

    static get styles(): CSSResultArray {
        return [
            HacsStyle,
            css`
            .loader {
                background-color: var(--primary-background-color);
                height: 100%;
                width: 100%;
              }

            `]
    }
}