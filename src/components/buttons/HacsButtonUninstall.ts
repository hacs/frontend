import { customElement, CSSResultArray, css, TemplateResult, html } from "lit-element";
import { HacsStyle } from "../../style/hacs-style"
import { HacsRepositoryButton } from "./HacsRepositoryButton"
import { RepositoryWebSocketAction } from "../../misc/RepositoryWebSocketAction"

import { localize } from "../../localize/localize"

@customElement("hacs-button-uninstall")
export class HacsButtonUninstall extends HacsRepositoryButton {
    protected render(): TemplateResult | void {
        if (!this.repository.installed) return html``

        const label = localize('repository.uninstall');
        if (this.status.background_task) {
            return html`
            <mwc-button class="disabled-button" title="Uninstall is disabled while background tasks is running." @click=${this.disabledAction}>
                ${label}
            </mwc-button>
            `
        }

        return html`
            <mwc-button @click=${this.RepositoryUnInstall}">
                ${(this.repository.state == "uninstalling"
                ? html`<paper-spinner active></paper-spinner>`
                : html`${label}`)}
            </mwc-button>
        `;
    }
    static get styles(): CSSResultArray {
        return [HacsStyle, css`
          mwc-button {
            --mdc-theme-primary: var(--google-red-500);
          }
        `]
    }

    disabledAction() {
        window.alert("Uninstall is disabled while background tasks is running.")
    }

    RepositoryUnInstall() {
        if (window.confirm(
            localize("confirm.uninstall", "item", this.repository.name)
        )) this.ExecuteAction()
    }

    ExecuteAction() {
        RepositoryWebSocketAction(
            this.hass, this.repository.id, "set_state", "uninstalling");
        RepositoryWebSocketAction(
            this.hass, this.repository.id, "uninstall");
    }
}