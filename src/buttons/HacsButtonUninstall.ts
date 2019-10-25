import { customElement, TemplateResult, html } from "lit-element";
import { HacsRepositoryButton } from "./HacsRepositoryButton"
import { RepositoryWebSocketAction } from "../misc/RepositoryWebSocketAction"

@customElement("hacs-button-uninstall")
export class HacsButtonUninstall extends HacsRepositoryButton {
    protected render(): TemplateResult | void {
        if (!this.repository.installed) return html``

        return html`
            <mwc-button @click=${this.RepositoryUnInstall}>
                ${(this.repository.state == "uninstalling"
                ? html`<paper-spinner active></paper-spinner>`
                : html`${this.hass.localize('component.hacs.repository.uninstall')}`)}
            </mwc-button>
        `;
    }

    RepositoryUnInstall() {
        RepositoryWebSocketAction(
            this.hass, this.repository.id, "set_state", "uninstalling");
        RepositoryWebSocketAction(
            this.hass, this.repository.id, "uninstall");
    }
}