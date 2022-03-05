import "@material/mwc-button/mwc-button";
import {
  mdiAlert,
  mdiAlertCircleOutline,
  mdiArrowDownCircle,
  mdiClose,
  mdiGithub,
  mdiInformation,
  mdiLanguageJavascript,
  mdiReload,
} from "@mdi/js";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { ClassInfo, classMap } from "lit/directives/class-map";
import { navigate } from "../../homeassistant-frontend/src/common/navigate";
import "../../homeassistant-frontend/src/components/ha-card";
import "../../homeassistant-frontend/src/components/ha-chip";
import "../../homeassistant-frontend/src/components/ha-icon-overflow-menu";
import { getConfigEntries } from "../../homeassistant-frontend/src/data/config_entries";
import { showConfirmationDialog } from "../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { Repository } from "../data/common";
import { Hacs } from "../data/hacs";
import {
  deleteResource,
  fetchResources,
  repositorySetNotNew,
  repositoryUninstall,
  repositoryUpdate,
} from "../data/websocket";
import { HacsStyles } from "../styles/hacs-common-style";
import { generateLovelaceURL } from "../tools/added-to-lovelace";
import "./hacs-link";
import { mainWindow } from "../../homeassistant-frontend/src/common/dom/get_main_window";

@customElement("hacs-repository-card")
export class HacsRepositoryCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public hacs!: Hacs;

  @property({ attribute: false }) public repository!: Repository;

  @property({ type: Boolean }) public narrow!: boolean;

  private get _borderClass(): ClassInfo {
    const classes = {};
    if (
      !this.hacs.addedToLovelace!(this.hacs, this.repository) ||
      this.repository.status === "pending-restart"
    ) {
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
    if (
      !this.hacs.addedToLovelace!(this.hacs, this.repository) ||
      this.repository.status === "pending-restart"
    ) {
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
    if (!this.hacs.addedToLovelace!(this.hacs, this.repository)) {
      return this.hacs.localize("repository_card.not_loaded");
    }
    if (this.repository.status === "pending-restart") {
      return this.hacs.localize("repository_card.pending_restart");
    }
    if (this.repository.pending_upgrade) {
      return this.hacs.localize("repository_card.pending_update");
    }
    if (this.repository.new && !this.repository.installed) {
      return this.hacs.localize("repository_card.new_repository");
    }
    return "";
  }

  protected render(): TemplateResult | void {
    const path = this.repository.local_path.split("/");
    return html`
      <ha-card class=${classMap(this._borderClass)} ?narrow=${this.narrow}>
        <div class="card-content">
          <div class="group-header">
            <div class="status-header ${classMap(this._headerClass)}">${this._headerTitle}</div>
            <div class="title pointer" @click=${this._showReopsitoryInfo}>
              <h1>${this.repository.name}</h1>
              ${this.repository.category !== "integration"
                ? html` <ha-chip>
                    ${this.hacs.localize(`common.${this.repository.category}`)}
                  </ha-chip>`
                : ""}
            </div>
          </div>
          <div class="description">${this.repository.description}</div>
        </div>
        <div class="card-actions">
          ${this.repository.installed
            ? html` <ha-icon-overflow-menu
                slot="toolbar-icon"
                narrow
                .hass=${this.hass}
                .items=${[
                  {
                    path: mdiInformation,
                    label: this.hacs.localize("repository_card.information"),
                    action: () => this._showReopsitoryInfo(),
                  },
                  {
                    path: mdiGithub,
                    label: this.hacs.localize("common.repository"),
                    action: () =>
                      mainWindow.open(
                        `https://github.com/${this.repository.full_name}`,
                        "_blank",
                        "noreferrer=true"
                      ),
                  },
                  {
                    path: mdiArrowDownCircle,
                    label: this.hacs.localize("repository_card.update_information"),
                    action: () => this._updateReopsitoryInfo(),
                  },
                  {
                    path: mdiReload,
                    label: this.hacs.localize("repository_card.redownload"),
                    action: () => this._installRepository(),
                  },
                  {
                    category: "plugin",
                    path: mdiLanguageJavascript,
                    label: this.hacs.localize("repository_card.open_source"),
                    action: () =>
                      mainWindow.open(
                        `/hacsfiles/${path.pop()}/${this.repository.file_name}`,
                        "_blank",
                        "noreferrer=true"
                      ),
                  },
                  {
                    path: mdiAlertCircleOutline,
                    label: this.hacs.localize("repository_card.open_issue"),
                    action: () =>
                      mainWindow.open(
                        `https://github.com/${this.repository.full_name}/issues`,
                        "_blank",
                        "noreferrer=true"
                      ),
                  },
                  {
                    hideForId: "172733314",
                    path: mdiAlert,
                    label: this.hacs.localize("repository_card.report"),
                    action: () =>
                      mainWindow.open(
                        `https://github.com/hacs/integration/issues/new?assignees=ludeeus&labels=flag&template=removal.yml&repo=${this.repository.full_name}&title=Request for removal of ${this.repository.full_name}`,
                        "_blank",
                        "noreferrer=true"
                      ),
                  },
                  {
                    hideForId: "172733314",
                    path: mdiClose,
                    label: this.hacs.localize("common.remove"),
                    action: () => this._uninstallRepositoryDialog(),
                  },
                ].filter(
                  (entry) =>
                    (!entry.category || this.repository.category === entry.category) &&
                    (!entry.hideForId || String(this.repository.id) !== entry.hideForId)
                )}
              >
              </ha-icon-overflow-menu>`
            : ""}
          ${this.repository.new && !this.repository.installed
            ? html`<div>
                <mwc-button class="status-new" @click=${this._setNotNew}>
                  ${this.hacs.localize("repository_card.dismiss")}
                </mwc-button>
              </div>`
            : this.repository.pending_upgrade &&
              this.hacs.addedToLovelace!(this.hacs, this.repository)
            ? html`<div>
                <mwc-button class="update-header" @click=${this._updateRepository} raised>
                  ${this.hacs.localize("common.update")}
                </mwc-button>
              </div> `
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
          type: "download",
          repository: this.repository.id,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _uninstallRepositoryDialog() {
    if (this.repository.category === "integration" && this.repository.config_flow) {
      const configFlows = (await getConfigEntries(this.hass)).some(
        (entry) => entry.domain === this.repository.domain
      );
      if (configFlows) {
        const ignore = await showConfirmationDialog(this, {
          title: this.hacs.localize("dialog.configured.title"),
          text: this.hacs.localize("dialog.configured.message", { name: this.repository.name }),
          dismissText: this.hacs.localize("common.ignore"),
          confirmText: this.hacs.localize("common.navigate"),
          confirm: () => {
            navigate("/config/integrations", { replace: true });
          },
        });
        if (ignore) {
          return;
        }
      }
    }
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "progress",
          title: this.hacs.localize("dialog.remove.title"),
          confirmText: this.hacs.localize("dialog.remove.title"),
          content: this.hacs.localize("dialog.remove.message", { name: this.repository.name }),
          confirm: async () => {
            await this._uninstallRepository();
          },
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _uninstallRepository() {
    if (this.repository.category === "plugin" && this.hacs.status?.lovelace_mode !== "yaml") {
      const resources = await fetchResources(this.hass);
      const expectedURL = generateLovelaceURL({ repository: this.repository, skipTag: true });
      await Promise.all(
        resources
          .filter((resource) => resource.url.includes(expectedURL))
          .map((resource) => deleteResource(this.hass, String(resource.id)))
      );
    }
    await repositoryUninstall(this.hass, this.repository.id);
  }

  static get styles(): CSSResultGroup {
    return [
      HacsStyles,
      css`
        ha-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 480px;
          border-style: solid;
          border-width: min(var(--ha-card-border-width, 1px), 10px);
          border-color: transparent;
          border-radius: var(--ha-card-border-radius, 4px);
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
          flex-direction: row-reverse;
          justify-content: space-between;
          align-items: center;
          padding: 5px;
        }
        .group-header {
          height: auto;
          align-content: center;
        }
        .group-header h1 {
          margin: 0;
          padding: 8px 16px;
          font-size: 22px;
        }
        h1 {
          margin-top: 0;
          min-height: 24px;
        }

        .pointer {
          cursor: pointer;
        }
        .description {
          opacity: var(--dark-primary-opacity);
          font-size: 14px;
          padding: 8px 16px;
        }

        .status-new {
          border-color: var(--hcv-color-new);
          --mdc-theme-primary: var(--hcv-color-new);
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
          padding: 2px 0 !important;
        }

        mwc-button.update-header {
          --mdc-theme-primary: var(--hcv-color-update);
          --mdc-theme-on-primary: var(--hcv-text-color-on-background);
        }

        .status-border {
          border-style: solid;
          border-width: min(var(--ha-card-border-width, 1px), 10px);
        }

        .status-header {
          top: 0;
          padding: 6px 1px;
          margin: -1px;
          width: 100%;
          font-weight: 500;
          text-align: center;
          left: 0;
          border-top-left-radius: var(--ha-card-border-radius, 4px);
          border-top-right-radius: var(--ha-card-border-radius, 4px);
        }

        ha-card[narrow] {
          width: calc(100% - 24px);
          margin: 11px;
        }

        ha-chip {
          padding: 4px;
          margin-top: 3px;
        }
      `,
    ];
  }
}
