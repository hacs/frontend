import { LitElement, customElement, CSSResultArray, css, TemplateResult, html, property } from "lit-element";
import { Status } from "../types"
import { HacsStyle } from "../style/hacs-style"

@customElement("hacs-progressbar")
export class HacsProgressbar extends LitElement {
    @property() public status!: Status;

    protected render(): TemplateResult | void {
        if (!this.status.background_task) return html``;

        return html`
            <paper-progress indeterminate></paper-progress>
        `;
    }

    static get styles(): CSSResultArray {
        return [HacsStyle, css`
            paper-progress {
                width: 100%;
                --paper-progress-active-color: var(--accent-color);
            }
        `]
    }
}