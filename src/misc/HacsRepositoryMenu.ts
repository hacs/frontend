import { customElement, css, CSSResultArray, TemplateResult, html, LitElement, property } from "lit-element";
import { RepositoryWebSocketAction } from "./RepositoryWebSocketAction"
import { Repository } from "../types";
import { HacsStyle } from "../style/hacs-style"
import { HomeAssistant } from "custom-card-helpers";
import { localize } from "../localize/localize"

@customElement("hacs-repository-menu")
export class HacsRepositoryMenu extends LitElement {
    @property() public hass!: HomeAssistant;
    @property() public repository!: Repository;

    protected render(): TemplateResult | void {
        return html`
        <paper-menu-button no-animations horizontal-align="right" role="group" aria-haspopup="true" vertical-align="top" aria-disabled="false">
        <paper-icon-button icon="hass:dots-vertical" slot="dropdown-trigger" role="button"></paper-icon-button>
            <paper-listbox slot="dropdown-content" role="listbox" tabindex="0">


                <paper-item @click=${this.RepositoryReload}>
                    ${localize(`repository.update_information`)}
                </paper-item>


                ${(this.repository.version_or_commit === "version" ? html`
                <paper-item @click=${this.RepositoryBeta}>
                    ${(this.repository.beta ?
                    localize(`repository.hide_beta`)
                    : localize(`repository.show_beta`))}
                </paper-item>`
                : "")}


                ${(!this.repository.custom && !this.repository.installed ? html`
                <paper-item @click=${this.RepositoryHide}>
                    ${localize(`repository.hide`)}
                </paper-item>`
                : "")}


                <a href="https://github.com/${this.repository.full_name}" rel='noreferrer' target="_blank">
                <paper-item>
                    <ha-icon class="link-icon" icon="mdi:open-in-new"></ha-icon>
                    ${localize(`repository.open_issue`)}
                </paper-item>
                </a>


                <a href="https://github.com/hacs/default/issues/new?assignees=ludeeus&labels=flag&template=flag.md&title=${this.repository.full_name}" rel='noreferrer' target="_blank">
                <paper-item>
                    <ha-icon class="link-icon" icon="mdi:open-in-new"></ha-icon>
                    ${localize(`repository.flag_this`)}
                </paper-item>
                </a>


            </paper-listbox>
        </paper-menu-button>
        `;
    }

    static get styles(): CSSResultArray {
        return [HacsStyle, css`
        paper-dropdown-menu {
            width: 250px;
            margin-top: -24px;

          }
          paper-menu-button {
            float: right;
            top: -65px;
          }
        `]
    }

    RepositoryReload() {
        RepositoryWebSocketAction(this.hass, this.repository.id, "set_state", "other");
        RepositoryWebSocketAction(this.hass, this.repository.id, "update");
    }

    RepositoryBeta() {
        RepositoryWebSocketAction(this.hass, this.repository.id, "set_state", "other");
        if (this.repository.beta) {
            RepositoryWebSocketAction(this.hass, this.repository.id, "hide_beta");
        } else {
            RepositoryWebSocketAction(this.hass, this.repository.id, "show_beta");
        }
    }

    RepositoryHide() {
        RepositoryWebSocketAction(this.hass, this.repository.id, "set_state", "other");
        if (this.repository.hide) {
            RepositoryWebSocketAction(this.hass, this.repository.id, "unhide");
        } else {
            RepositoryWebSocketAction(this.hass, this.repository.id, "hide");
        }
    }
}