import { customElement, TemplateResult, html } from "lit-element";
import { HacsRepositoryButton } from "./HacsRepositoryButton"
import { RepositoryWebSocketAction } from "../misc/RepositoryWebSocketAction"

@customElement("hacs-button-changelog")
export class HacsButtonChangelog extends HacsRepositoryButton {
    protected render(): TemplateResult | void {
        if (!this.repository.pending_upgrade) return html``

        return html`
        <a href="https://github.com/${this.repository.full_name}/releases" rel='noreferrer' target="_blank">
          <mwc-button>
          ${this.hass.localize(`component.hacs.repository.changelog`)}
          </mwc-button>
        </a>
        `;
    }

    RepositoryInstall() {
        RepositoryWebSocketAction(
            this.hass, this.repository.id, "set_state", "installing");
        RepositoryWebSocketAction(
            this.hass, this.repository.id, "uninstall");
    }
}