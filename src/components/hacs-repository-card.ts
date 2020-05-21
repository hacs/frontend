import {
  css,
  CSSResultArray,
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";

import { HacsCommonStyle } from "../styles/hacs-common-style";
import { Repository } from "../data/common";
import { repositorySetNotNew, repositoryUninstall, repositoryUpdate } from "../data/websocket";
import { HomeAssistant } from "custom-card-helpers";

@customElement("hacs-repository-card")
export class HacsRepositoryCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public repository!: Repository;

  protected render(): TemplateResult | void {
    const path = this.repository.local_path.split("/");
    return html`
      <ha-card
        class=${classMap({
          "status-border":
            this.repository.new || this.repository.pending_upgrade,
          "status-new": this.repository.new,
          "status-update": this.repository.pending_upgrade,
        })}
      >
        <div class="card-content">
          <div class="group-header">
            ${this.repository.pending_upgrade
              ? html`
                  <div class="status-header update-header">Pending update</div>
                `
              : this.repository.new
              ? html`
                  <div class="status-header new-header">New repository</div>
                `
              : html`<div class="status-header default-header"></div>`}

            <h2 class="pointer" @click=${this._showReopsitoryInfo}>
              ${this.repository.name}
            </h2>
          </div>
          <paper-item>
            <paper-item-body
              >${this.repository.description}</paper-item-body
            ></paper-item
          >
        </div>
        <div class="card-actions">
          ${this.repository.new
            ? html`<div>
                  <mwc-button @click=${this._installRepository}
                    >Install</mwc-button
                  >
                </div>
                <div>
                  <mwc-button @click=${this._showReopsitoryInfo}
                    >Information</mwc-button
                  >
                </div>
                <div>
                  <hacs-link
                    .url="https://github.com/${this.repository.full_name}"
                    ><mwc-button>Repository</mwc-button></hacs-link
                  >
                </div>
                <div>
                  <mwc-button @click=${this._setNotNew}>Hide</mwc-button>
                </div>`
            : this.repository.pending_upgrade
            ? html`<div>
                <mwc-button
                  class="update-header"
                  @click=${this._updateRepository}
                  raised
                  >Update</mwc-button
                >
              </div>`
            : html`<div>
                <hacs-link
                  .url="https://github.com/${this.repository.full_name}"
                  ><mwc-button>Repository</mwc-button></hacs-link
                >
              </div>`}
          ${this.repository.installed
            ? html` <paper-menu-button
                horizontal-align="right"
                vertical-align="top"
                vertical-offset="40"
                close-on-activate
              >
                <ha-icon-button
                  icon="hass:dots-vertical"
                  slot="dropdown-trigger"
                ></ha-icon-button>
                <paper-listbox slot="dropdown-content">
                  <paper-item
                    class="pointer"
                    @click=${this._updateReopsitoryInfo}
                    >Update information</paper-item
                  >

                  <paper-item class="pointer" @click=${this._showReopsitoryInfo}
                    >Information</paper-item
                  >
                  <paper-item @click=${this._installRepository}
                    >Reinstall</paper-item
                  >
                  ${this.repository.category === "plugin"
                    ? html`<hacs-link
                        .url="/hacsfiles/${path.pop()}/${this.repository
                          .file_name}"
                        newtab
                        ><paper-item class="pointer"
                          >Open source</paper-item
                        ></hacs-link
                      >`
                    : ""}

                  <hacs-link
                    .url="https://github.com/${this.repository
                      .full_name}/issues"
                    ><paper-item class="pointer"
                      >Open issue</paper-item
                    ></hacs-link
                  >
                  ${String(this.repository.id) !== "172733314"
                    ? html`<hacs-link
                          .url="https://github.com/hacs/integration/issues/new?assignees=ludeeus&labels=flag&template=flag.md&title=${this
                            .repository.full_name}"
                          ><paper-item class="pointer uninstall"
                            >Report for removal</paper-item
                          ></hacs-link
                        >
                        <paper-item
                          class="pointer uninstall"
                          @click=${this._uninstallRepository}
                          >Uninstall</paper-item
                        >`
                    : ""}
                </paper-listbox>
              </paper-menu-button>`
            : ""}
        </div>
      </ha-card>
    `;
  }

  private async _updateReopsitoryInfo() {
    await repositoryUpdate(this.hass, this.repository.id)
  }

  private async _showReopsitoryInfo() {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "repository-info",
          repository: this.repository.id,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _updateRepository() {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "update",
          repository: this.repository.id,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _setNotNew() {
    await repositorySetNotNew(this.hass, this.repository.id);
  }

  private _installRepository() {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "install",
          repository: this.repository.id,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _uninstallRepository() {
    await repositoryUninstall(this.hass, this.repository.id);
  }

  static get styles(): CSSResultArray {
    return [
      HacsCommonStyle,
      css`
        :host {
          max-width: 500px;
        }
        ha-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .card-content {
          padding: 0 0 3px 0;
          height: 100%;
        }
        .card-actions {
          border-top: none;
          bottom: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-right: 5px;
        }
        .group-header {
          height: auto;
          align-content: center;
        }
        .group-header h2 {
          margin: 0;
          padding: 8px 16px;
        }
        h2 {
          margin-top: 0;
          min-height: 24px;
        }
        paper-menu-button {
          color: var(--secondary-text-color);
          padding: 0;
          float: right;
        }

        .pointer {
          cursor: pointer;
        }
        paper-item-body {
          opacity: var(--dark-primary-opacity);
        }

        .status-new {
          border-color: var(--hacs-new-color, var(--google-blue-500));
        }

        .status-update {
          border-color: var(--hacs-update-color, var(--google-yellow-500));
        }

        .new-header {
          background-color: var(--hacs-new-color, var(--google-blue-500));
          color: var(--hacs-new-text-color, var(--text-primary-color));
        }

        .update-header {
          background-color: var(--hacs-update-color, var(--google-yellow-500));
          color: var(--hacs-update-text-color, var(--text-primary-color));
        }

        .default-header {
          padding: 10px 0 !important;
        }

        mwc-button.update-header {
          --mdc-theme-primary: var(
            --hacs-update-color,
            var(--google-yellow-500)
          );
          --mdc-theme-on-primary: var(
            --hacs-update-text-color,
            var(--text-primary-color)
          );
        }

        .status-border {
          border-style: solid;
          border-width: 1px;
        }

        .status-header {
          top: 0;
          padding: 6px 1px;
          margin: -1px;
          width: 100%;
          font-weight: 300;
          text-align: center;
          left: 0;
          border-top-left-radius: var(--ha-card-border-radius);
          border-top-right-radius: var(--ha-card-border-radius);
        }
        .uninstall {
          color: var(--hacs-error-color, var(--google-red-500));
        }
      `,
    ];
  }
}
