import { customElement, CSSResultArray, css, TemplateResult, html } from "lit-element";
import { HacsStyle } from "../../style/hacs-style"
import { HacsRepositoryButton } from "./HacsRepositoryButton"
import { RepositoryWebSocketAction } from "../../misc/RepositoryWebSocketAction"
import swal from 'sweetalert';

import { localize } from "../../localize/localize"

@customElement("hacs-button-uninstall")
export class HacsButtonUninstall extends HacsRepositoryButton {
    protected render(): TemplateResult | void {
        if (!this.repository.installed) return html``

        const label = localize('repository.uninstall');
        if (this.status.background_task) {
            return html`
            <mwc-button class="disabled-button" title="${localize("confirm.bg_task_uninstall")}" @click=${this.disabledAction}>
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
        swal(localize("confirm.bg_task_uninstall"), { buttons: [localize("confirm.ok")] })
    }

    RepositoryUnInstall() {
        swal(localize("confirm.uninstall", "{item}", this.repository.name), {
            buttons: [localize("confirm.cancel"), localize("confirm.yes")]
        }).then((value) => {
            if (value !== null) {
                this.ExecuteAction()
            }
        });
    }

    ExecuteAction() {
        RepositoryWebSocketAction(
            this.hass, this.repository.id, "set_state", "uninstalling");
        RepositoryWebSocketAction(
            this.hass, this.repository.id, "uninstall");
    }
}