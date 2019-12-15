import { customElement, TemplateResult, html } from "lit-element";
import { HacsRepositoryButton } from "./HacsRepositoryButton"
import { RepositoryWebSocketAction } from "../../misc/RepositoryWebSocketAction"

import { localize } from "../../localize/localize"

@customElement("hacs-button-changelog")
export class HacsButtonChangelog extends HacsRepositoryButton {
    protected render(): TemplateResult | void {
        if (!this.repository.pending_upgrade) return html``

        var URL: String = `https://github.com/${this.repository.full_name}/releases`

        if (this.repository.version_or_commit === "commit") {
            URL = `https://github.com/${this.repository.full_name}/compare/${this.repository.installed_version}...${this.repository.available_version}`
        }

        return html`
        <a href="${URL}" rel='noreferrer' target="_blank">
          <mwc-button>
          ${localize(`repository.changelog`)}
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