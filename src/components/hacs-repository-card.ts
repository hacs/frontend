import {
  css,
  CSSResultArray,
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";
import { classMap, ClassInfo } from "lit-html/directives/class-map";
import { localize } from "../localize/localize";
import { HacsStyles } from "../styles/hacs-common-style";
import { Repository, Status, RemovedRepository } from "../data/common";
import {
  repositorySetNotNew,
  repositoryUninstall,
  repositoryUpdate,
  fetchResources,
  deleteResource,
} from "../data/websocket";
import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { mdiDotsVertical } from "@mdi/js";
import { hacsIcon } from "./hacs-icon";
import "../components/hacs-icon-button";
import "../components/hacs-link";

@customElement("hacs-repository-card")
export class HacsRepositoryCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public repository!: Repository;
  @property({ attribute: false }) public status: Status;
  @property({ attribute: false }) public removed: RemovedRepository[];
  @property({ type: Boolean }) public narrow!: boolean;
  @property({ type: Boolean }) public addedToLovelace!: boolean;

  private get _borderClass(): ClassInfo {
    const classes = {};
    if (!this.addedToLovelace || this.repository.status === "pending-restart") {
      classes["status-issue"] = true;
    } else if (this.repository.pending_upgrade) {
      classes["status-update"] = true;
    } else if (this.repository.new && !this.repository.installed) {
      classes["status-new"] = true;
    }
    if (Object.keys(classes).length !== 0) {
      classes["status-border"] = true;
    }

    return classes;
  }

  private get _headerClass(): ClassInfo {
    const classes = {};
    if (!this.addedToLovelace || this.repository.status === "pending-restart") {
      classes["issue-header"] = true;
    } else if (this.repository.pending_upgrade) {
      classes["update-header"] = true;
    } else if (this.repository.new && !this.repository.installed) {
      classes["new-header"] = true;
    } else {
      classes["default-header"] = true;
    }

    return classes;
  }

  private get _headerTitle(): string {
    if (!this.addedToLovelace) {
      return localize("repository_card.not_loaded");
    }
    if (this.repository.status === "pending-restart") {
      return localize("repository_card.pending_restart");
    }
    if (this.repository.pending_upgrade) {
      return localize("repository_card.pending_update");
    }
    if (this.repository.new && !this.repository.installed) {
      return localize("repository_card.new_repository");
    }
    return "";
  }

  protected render(): TemplateResult | void {
    const path = this.repository.local_path.split("/");
    return html`
      <ha-card class=${classMap(this._borderClass)} ?narrow=${this.narrow}>
        <div class="card-content">
          <div class="group-header">
            <div class="status-header ${classMap(this._headerClass)}">
              ${this._headerTitle}
            </div>
            <div class="title">
              <h2 class="pointer" @click=${this._showReopsitoryInfo}>
                ${this.repository.name}
              </h2>
              ${this.repository.category !== "integration"
                ? html` <hacs-chip
                    .icon=${hacsIcon}
                    .value=${localize(`common.${this.repository.category}`)}
                  ></hacs-chip>`
                : ""}
            </div>
          </div>
          <paper-item>
            <paper-item-body>${this.repository.description}</paper-item-body></paper-item
          >
        </div>
        <div class="card-actions">
          ${this.repository.new && !this.repository.installed
            ? html`<div>
                  <mwc-button @click=${this._installRepository}
                    >${localize("common.install")}</mwc-button
                  >
                </div>
                <div>
                  <mwc-button @click=${this._showReopsitoryInfo}
                    >${localize("repository_card.information")}</mwc-button
                  >
                </div>
                <div>
                  <hacs-link .url="https://github.com/${this.repository.full_name}"
                    ><mwc-button>${localize("common.repository")}</mwc-button></hacs-link
                  >
                </div>
                <div>
                  <mwc-button @click=${this._setNotNew}
                    >${localize("repository_card.dismiss")}</mwc-button
                  >
                </div>`
            : this.repository.pending_upgrade && this.addedToLovelace
            ? html`<div>
                <mwc-button class="update-header" @click=${this._updateRepository} raised
                  >${localize("common.update")}</mwc-button
                >
              </div>`
            : html`<div>
                <hacs-link .url="https://github.com/${this.repository.full_name}"
                  ><mwc-button>${localize("common.repository")}</mwc-button></hacs-link
                >
              </div>`}
          ${this.repository.installed
            ? html` <paper-menu-button
                horizontal-align="right"
                vertical-align="top"
                vertical-offset="40"
                close-on-activate
              >
                <hacs-icon-button
                  .icon=${mdiDotsVertical}
                  slot="dropdown-trigger"
                ></hacs-icon-button>
                <paper-listbox slot="dropdown-content">
                  <paper-item class="pointer" @tap=${this._showReopsitoryInfo}
                    >${localize("repository_card.information")}</paper-item
                  >

                  <paper-item class="pointer" @tap=${this._updateReopsitoryInfo}
                    >${localize("repository_card.update_information")}</paper-item
                  >

                  <paper-item @tap=${this._installRepository}
                    >${localize("repository_card.reinstall")}</paper-item
                  >

                  ${this.repository.category === "plugin"
                    ? html`<hacs-link
                        .url="/hacsfiles/${path.pop()}/${this.repository.file_name}"
                        newtab
                        ><paper-item class="pointer"
                          >${localize("repository_card.open_source")}</paper-item
                        ></hacs-link
                      >`
                    : ""}

                  <hacs-link .url="https://github.com/${this.repository.full_name}/issues"
                    ><paper-item class="pointer"
                      >${localize("repository_card.open_issue")}</paper-item
                    ></hacs-link
                  >

                  ${String(this.repository.id) !== "172733314"
                    ? html`<hacs-link
                          .url="https://github.com/hacs/integration/issues/new?assignees=ludeeus&labels=flag&template=flag.md&title=${this
                            .repository.full_name}"
                          ><paper-item class="pointer uninstall"
                            >${localize("repository_card.report")}</paper-item
                          ></hacs-link
                        >
                        <paper-item class="pointer uninstall" @tap=${this._uninstallRepository}
                          >${localize("common.uninstall")}</paper-item
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
    await repositoryUpdate(this.hass, this.repository.id);
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

  private _lovelaceUrl(): string {
    return `/hacsfiles/${this.repository?.full_name.split("/")[1]}/${this.repository?.file_name}`;
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
    if (this.repository.category === "plugin" && this.status.lovelace_mode !== "yaml") {
      const resources = await fetchResources(this.hass);
      resources
        .filter((resource) => resource.url === this._lovelaceUrl())
        .forEach((resource) => {
          deleteResource(this.hass, String(resource.id));
        });
    }
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyles,
      css`
        ha-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 480px;
        }
        ha-card[narrow] {
          width: 100%;
        }
        hacs-chip {
          margin: 8px 4px 0 0;
        }
        .title {
          display: flex;
          justify-content: space-between;
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
          padding: 5px;
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
          border-color: var(--hcv-color-new);
        }

        .status-update {
          border-color: var(--hcv-color-update);
        }

        .status-issue {
          border-color: var(--hcv-color-error);
        }

        .new-header {
          background-color: var(--hcv-color-new);
          color: var(--hcv-text-color-on-background);
        }

        .issue-header {
          background-color: var(--hcv-color-error);
          color: var(--hcv-text-color-on-background);
        }

        .update-header {
          background-color: var(--hcv-color-update);
          color: var(--hcv-text-color-on-background);
        }

        .default-header {
          padding: 10px 0 !important;
        }

        mwc-button.update-header {
          --mdc-theme-primary: var(--hcv-color-update);
          --mdc-theme-on-primary: var(--hcv-text-color-on-background);
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
      `,
    ];
  }
}
