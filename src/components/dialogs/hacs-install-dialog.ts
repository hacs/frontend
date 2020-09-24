import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";
import {
  css,
  CSSResultArray,
  customElement,
  html,
  property,
  PropertyValues,
  query,
  TemplateResult,
} from "lit-element";
import memoizeOne from "memoize-one";
import "../../../homeassistant-frontend/src/components/ha-circular-progress";
import "../../../homeassistant-frontend/src/components/ha-formfield";
import "../../../homeassistant-frontend/src/components/ha-switch";
import { Repository } from "../../data/common";
import {
  getRepositories,
  repositoryInstall,
  repositoryInstallVersion,
  repositoryToggleBeta,
  repositoryUpdate,
} from "../../data/websocket";
import { localize } from "../../localize/localize";
import { updateLovelaceResources } from "../../tools/update-lovelace-resources";
import "../hacs-link";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";

@customElement("hacs-install-dialog")
export class HacsInstallDialog extends HacsDialogBase {
  @property() public repository?: string;
  @property() public _repository?: Repository;
  @property() private _toggle: boolean = true;
  @property() private _installing: boolean = false;
  @property() private _error?: any;

  @query("#version") private _version?: any;

  shouldUpdate(changedProperties: PropertyValues) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "hass") {
        this.sidebarDocked = window.localStorage.getItem("dockedSidebar") === '"docked"';
      }
      if (propName === "repositories") {
        this._repository = this._getRepository(this.repositories, this.repository);
      }
    });
    return (
      changedProperties.has("sidebarDocked") ||
      changedProperties.has("narrow") ||
      changedProperties.has("active") ||
      changedProperties.has("_toggle") ||
      changedProperties.has("_error") ||
      changedProperties.has("_repository") ||
      changedProperties.has("_installing")
    );
  }

  private _getRepository = memoizeOne((repositories: Repository[], repository: string) =>
    repositories?.find((repo) => repo.id === repository)
  );

  private _getInstallPath = memoizeOne((repository: Repository) => {
    let path: string = repository.local_path;
    if (repository.category === "theme") {
      path = `${path}/${repository.file_name}`;
    }
    return path;
  });

  protected async firstUpdated() {
    this._repository = this._getRepository(this.repositories, this.repository);
    if (!this._repository.updated_info) {
      await repositoryUpdate(this.hass, this._repository.id);
      this.repositories = await getRepositories(this.hass);
    }
    this._toggle = false;
    this.hass.connection.subscribeEvents((msg) => (this._error = (msg as any).data), "hacs/error");
  }

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const installPath = this._getInstallPath(this._repository);
    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
        .secondary=${this.secondary}
        .title=${this._repository.name}
        dynamicHeight
      >
        <div class="content">
          ${this._repository.version_or_commit === "version"
            ? html`<div class="beta-container">
                  <ha-formfield .label=${localize("dialog_install.show_beta")}>
                    <ha-switch
                      ?disabled=${this._toggle}
                      .checked=${this._repository.beta}
                      @change=${this._toggleBeta}
                    ></ha-switch>
                  </ha-formfield>
                </div>
                <div class="version-select-container">
                  <paper-dropdown-menu
                    ?disabled=${this._toggle}
                    class="version-select-dropdown"
                    label="${localize("dialog_install.select_version")}"
                  >
                    <paper-listbox
                      id="version"
                      class="version-select-list"
                      slot="dropdown-content"
                      selected="0"
                    >
                      ${this._repository.releases.map((release) => {
                        return html`<paper-item .version=${release} class="version-select-item"
                          >${release}</paper-item
                        >`;
                      })}
                      ${this._repository.full_name === "hacs/integration" ||
                      this._repository.hide_default_branch
                        ? ""
                        : html`
                            <paper-item
                              .version=${this._repository.default_branch}
                              class="version-select-item"
                              >${this._repository.default_branch}</paper-item
                            >
                          `}
                    </paper-listbox>
                  </paper-dropdown-menu>
                </div>`
            : ""}
          ${!this._repository.can_install
            ? html`<p class="error">
                ${localize("confirm.home_assistant_version_not_correct")
                  .replace("{haversion}", this.hass.config.version)
                  .replace("{minversion}", this._repository.homeassistant)}
              </p>`
            : ""}
          <div class="note">
            ${localize(`repository.note_installed`)}
            <code>'${installPath}'</code>
            ${this._repository.category === "plugin" && this.hacs.status.lovelace_mode !== "storage"
              ? html`
                  <p>${localize(`repository.lovelace_instruction`)}</p>
                  <pre>
                url: ${this._lovelaceUrl()}
                type: module
                </pre
                  >
                `
              : ""}
            ${this._repository.category === "integration"
              ? html`<p>${localize("dialog_install.restart")}</p>`
              : ""}
          </div>
          ${this._error ? html`<div class="error">${this._error.message}</div>` : ""}
        </div>
        <mwc-button
          slot="primaryaction"
          ?disabled=${!this._repository.can_install || this._toggle}
          @click=${this._installRepository}
          >${this._installing
            ? html`<ha-circular-progress active></ha-circular-progress>`
            : localize("common.install")}</mwc-button
        >
        <hacs-link slot="secondaryaction" .url="https://github.com/${this._repository.full_name}"
          ><mwc-button>${localize("common.repository")}</mwc-button></hacs-link
        >
      </hacs-dialog>
    `;
  }

  private _lovelaceUrl(): string {
    return `/hacsfiles/${this._repository?.full_name.split("/")[1]}/${this._repository?.file_name}`;
  }

  private async _toggleBeta(): Promise<void> {
    this._toggle = true;
    await repositoryToggleBeta(this.hass, this.repository);
    this.repositories = await getRepositories(this.hass);
    this._toggle = false;
  }

  private async _installRepository(): Promise<void> {
    this._installing = true;
    if (this._repository.version_or_commit !== "commit") {
      const selectedVersion =
        this._version?.selectedItem?.version ||
        this._repository.available_version ||
        this._repository.default_branch;
      await repositoryInstallVersion(this.hass, this._repository.id, selectedVersion);
    } else {
      await repositoryInstall(this.hass, this._repository.id);
    }
    this.hacs.log.debug(this._repository.category, "_installRepository");
    this.hacs.log.debug(this.hacs.status.lovelace_mode, "_installRepository");
    if (this._repository.category === "plugin" && this.hacs.status.lovelace_mode === "storage") {
      await updateLovelaceResources(this.hass, this._repository);
    }
    this._installing = false;

    this.dispatchEvent(
      new Event("hacs-secondary-dialog-closed", {
        bubbles: true,
        composed: true,
      })
    );

    this.dispatchEvent(
      new Event("hacs-dialog-closed", {
        bubbles: true,
        composed: true,
      })
    );
    if (this._repository.category === "plugin" && this.hacs.status.lovelace_mode === "storage") {
      this.dispatchEvent(
        new CustomEvent("hacs-dialog", {
          detail: {
            type: "reload",
          },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  static get styles(): CSSResultArray {
    return [
      css`
        .version-select-dropdown {
          width: 100%;
        }
        .content {
          padding: 32px 8px;
        }
        .note {
          margin-bottom: -32px;
          margin-top: 12px;
        }
        .lovelace {
          margin-top: 8px;
        }
        .error {
          color: var(--hacs-error-color, var(--google-red-500));
        }
        paper-menu-button {
          color: var(--secondary-text-color);
          padding: 0;
        }
        paper-item {
          cursor: pointer;
        }
        paper-item-body {
          opacity: var(--dark-primary-opacity);
        }
        pre {
          white-space: pre-line;
          user-select: all;
        }
      `,
    ];
  }
}
