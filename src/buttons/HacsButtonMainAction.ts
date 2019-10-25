import { customElement, TemplateResult, html } from "lit-element";
import { HacsRepositoryButton } from "./HacsRepositoryButton"
import { RepositoryWebSocketAction } from "../misc/RepositoryWebSocketAction"

@customElement("hacs-button-main-action")
export class HacsButtonMainAction extends HacsRepositoryButton {
    protected render(): TemplateResult | void {
        return html`
            <mwc-button @click=${this.RepositoryInstall}>
                ${(this.repository.state == "installing"
                ? html`<paper-spinner active></paper-spinner>`
                : html`${this.hass.localize(
                    `component.hacs.repository.${this.repository.main_action.toLowerCase()}`)}`)}
            </mwc-button>
        `;
    }

    RepositoryInstall() {
        RepositoryWebSocketAction(
            this.hass, this.repository.id, "set_state", "installing");
        RepositoryWebSocketAction(
            this.hass, this.repository.id, "install");
    }
}