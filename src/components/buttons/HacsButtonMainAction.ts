import { customElement, TemplateResult, html, property } from "lit-element";
import { HacsRepositoryButton } from "./HacsRepositoryButton"
import { RepositoryWebSocketAction } from "../../misc/RepositoryWebSocketAction"
import { localize } from "../../localize/localize"

@customElement("hacs-button-main-action")
export class HacsButtonMainAction extends HacsRepositoryButton {

    @property() private pathExists: boolean = false;

    protected firstUpdated() {
        this.hass.connection.sendMessagePromise({
            type: "hacs/check_path",
            path: this.repository.local_path
        }).then(
            (resp) => {
                this.pathExists = resp["exist"];
            },
            (err) => {
                console.error('[hacs/check_path] Message failed!', err);
            }
        );
    }

    protected render(): TemplateResult | void {
        const label = localize(`repository.${this.repository.main_action.toLowerCase()}`)
        if (this.status.background_task) {
            return html`
                <mwc-button class="disabled-button" title="Installation/Upgrade is disabled while background tasks is running." @click=${this.disabledAction}>
                    ${label}
                </mwc-button>
            `
        }
        return html`
            <mwc-button @click=${this.RepositoryInstall}>
                ${(this.repository.state == "installing"
                ? html`<paper-spinner active></paper-spinner>`
                : html`${label}`)}
            </mwc-button>
        `;
    }

    disabledAction() {
        window.alert("Installation/Upgrade is disabled while background tasks is running.")
    }

    RepositoryInstall() {
        if (!this.repository.can_install) {
            window.alert(
                `This repository version requires Home Assistant version '${this.repository.homeassistant}' or newer`
            );
            return;
        }
        if (this.pathExists && !this.repository.installed) {
            if (window.confirm(
                localize("confirm.exsist", "item", this.repository.local_path)
                + "\n" + localize("confirm.overwrite")
                + "\n" + localize("confirm.continue")
            )) this.ExecuteAction()
        } else this.ExecuteAction()
    }

    ExecuteAction() {
        RepositoryWebSocketAction(
            this.hass, this.repository.id, "set_state", "installing");
        RepositoryWebSocketAction(
            this.hass, this.repository.id, "install");
    }
}