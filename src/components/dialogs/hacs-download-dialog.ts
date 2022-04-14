import { css, CSSResultGroup, html, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { mainWindow } from "../../../homeassistant-frontend/src/common/dom/get_main_window";
import { computeRTL } from "../../../homeassistant-frontend/src/common/util/compute_rtl";
import "../../../homeassistant-frontend/src/components/ha-alert";
import "../../../homeassistant-frontend/src/components/ha-circular-progress";
import "../../../homeassistant-frontend/src/components/ha-form/ha-form";
import { HaFormSchema } from "../../../homeassistant-frontend/src/components/ha-form/types";
import { showConfirmationDialog } from "../../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import { HacsDispatchEvent, Repository } from "../../data/common";
import {
  getRepositories,
  repositoryInstall,
  repositoryInstallVersion,
  repositorySetVersion,
  repositoryToggleBeta,
  repositoryUpdate,
  websocketSubscription,
} from "../../data/websocket";
import { HacsStyles } from "../../styles/hacs-common-style";
import { generateLovelaceURL } from "../../tools/added-to-lovelace";
import { updateLovelaceResources } from "../../tools/update-lovelace-resources";
import "../hacs-link";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";

@customElement("hacs-download-dialog")
export class HacsDonwloadDialog extends HacsDialogBase {
  @property() public repository?: string;

  @state() private _toggle = true;

  @state() private _installing = false;

  @state() private _error?: any;

  @state() public _repository?: Repository;

  @state() private _downloadRepositoryData = { beta: false, version: "" };

  shouldUpdate(changedProperties: PropertyValues) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "hass") {
        this.sidebarDocked = window.localStorage.getItem("dockedSidebar") === '"docked"';
      }
      if (propName === "repositories") {
        this._repository = this._getRepository(this.hacs.repositories, this.repository!);
      }
    });
    return (
      changedProperties.has("sidebarDocked") ||
      changedProperties.has("narrow") ||
      changedProperties.has("active") ||
      changedProperties.has("_toggle") ||
      changedProperties.has("_error") ||
      changedProperties.has("_repository") ||
      changedProperties.has("_downloadRepositoryData") ||
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
    this._repository = this._getRepository(this.hacs.repositories, this.repository!);
    if (!this._repository?.updated_info) {
      await repositoryUpdate(this.hass, this._repository!.id);
      const repositories = await getRepositories(this.hass);
      this.dispatchEvent(
        new CustomEvent("update-hacs", {
          detail: { repositories },
          bubbles: true,
          composed: true,
        })
      );
      this._repository = this._getRepository(repositories, this.repository!);
    }
    this._toggle = false;
    websocketSubscription(this.hass, (data) => (this._error = data), HacsDispatchEvent.ERROR);
    this._downloadRepositoryData.beta = this._repository!.beta;
    this._downloadRepositoryData.version =
      this._repository?.version_or_commit === "version" ? this._repository.releases[0] : "";
  }

  protected render(): TemplateResult | void {
    if (!this.active || !this._repository) return html``;
    const installPath = this._getInstallPath(this._repository);

    const donwloadRepositorySchema: HaFormSchema[] = [
      {
        name: "beta",
        selector: { boolean: {} },
      },
      {
        name: "version",
        selector: {
          select: {
            options:
              this._repository.version_or_commit === "version"
                ? this._repository.releases.concat(
                    this._repository.full_name === "hacs/integration" ||
                      this._repository.hide_default_branch
                      ? []
                      : [this._repository.default_branch]
                  )
                : [],
            mode: "dropdown",
          },
        },
      },
    ];
    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
        .secondary=${this.secondary}
        .title=${this._repository.name}
      >
        <div class="content">
          ${this._repository.version_or_commit === "version"
            ? html`
                <ha-form
                  .disabled=${this._toggle}
                  ?narrow=${this.narrow}
                  .data=${this._downloadRepositoryData}
                  .schema=${donwloadRepositorySchema}
                  .computeLabel=${(schema: HaFormSchema) =>
                    schema.name === "beta"
                      ? this.hacs.localize("dialog_download.show_beta")
                      : this.hacs.localize("dialog_download.select_version")}
                  @value-changed=${this._valueChanged}
                >
                </ha-form>
              `
            : ""}
          ${!this._repository.can_install
            ? html`<ha-alert alert-type="error" .rtl=${computeRTL(this.hass)}>
                ${this.hacs.localize("confirm.home_assistant_version_not_correct", {
                  haversion: this.hass.config.version,
                  minversion: this._repository.homeassistant,
                })}
              </ha-alert>`
            : ""}
          <div class="note">
            ${this.hacs.localize("dialog_download.note_downloaded", {
              location: html`<code>'${installPath}'</code>`,
            })}
            ${this._repository.category === "plugin" && this.hacs.status.lovelace_mode !== "storage"
              ? html`
                  <p>${this.hacs.localize(`dialog_download.lovelace_instruction`)}</p>
                  <pre>
                url: ${generateLovelaceURL({ repository: this._repository, skipTag: true })}
                type: module
                </pre
                  >
                `
              : ""}
            ${this._repository.category === "integration"
              ? html`<p>${this.hacs.localize("dialog_download.restart")}</p>`
              : ""}
          </div>
          ${this._error?.message
            ? html`<ha-alert alert-type="error" .rtl=${computeRTL(this.hass)}>
                ${this._error.message}
              </ha-alert>`
            : ""}
        </div>
        <mwc-button
          raised
          slot="primaryaction"
          ?disabled=${!this._repository.can_install ||
          this._toggle ||
          this._repository.version_or_commit === "version"
            ? !this._downloadRepositoryData.version
            : false}
          @click=${this._installRepository}
        >
          ${this._installing
            ? html`<ha-circular-progress active size="small"></ha-circular-progress>`
            : this.hacs.localize("common.download")}
        </mwc-button>
        <hacs-link slot="secondaryaction" .url="https://github.com/${this._repository.full_name}">
          <mwc-button> ${this.hacs.localize("common.repository")} </mwc-button>
        </hacs-link>
      </hacs-dialog>
    `;
  }

  private async _valueChanged(ev) {
    let updateNeeded = false;
    if (this._downloadRepositoryData.beta !== ev.detail.value.beta) {
      updateNeeded = true;
      this._toggle = true;
      await repositoryToggleBeta(this.hass, this.repository!);
    }
    if (ev.detail.value.version) {
      updateNeeded = true;
      this._toggle = true;

      await repositorySetVersion(this.hass, this.repository!, ev.detail.value.version);
    }
    if (updateNeeded) {
      const repositories = await getRepositories(this.hass);
      this.dispatchEvent(
        new CustomEvent("update-hacs", {
          detail: { repositories },
          bubbles: true,
          composed: true,
        })
      );
      this._repository = this._getRepository(repositories, this.repository!);
      this._toggle = false;
    }
    this._downloadRepositoryData = ev.detail.value;
  }

  private async _installRepository(): Promise<void> {
    this._installing = true;
    if (!this._repository) {
      return;
    }

    const selectedVersion =
      this._downloadRepositoryData.version ||
      this._repository.available_version ||
      this._repository.default_branch;

    if (this._repository?.version_or_commit !== "commit") {
      await repositoryInstallVersion(this.hass, this._repository.id, selectedVersion);
    } else {
      await repositoryInstall(this.hass, this._repository.id);
    }
    this.hacs.log.debug(this._repository.category, "_installRepository");
    this.hacs.log.debug(this.hacs.status.lovelace_mode, "_installRepository");
    if (this._repository.category === "plugin" && this.hacs.status.lovelace_mode === "storage") {
      await updateLovelaceResources(this.hass, this._repository, selectedVersion);
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
    if (this._repository.category === "plugin") {
      showConfirmationDialog(this, {
        title: this.hacs.localize!("common.reload"),
        text: html`${this.hacs.localize!("dialog.reload.description")}<br />${this.hacs.localize!(
            "dialog.reload.confirm"
          )}`,
        dismissText: this.hacs.localize!("common.cancel"),
        confirmText: this.hacs.localize!("common.reload"),
        confirm: () => {
          // eslint-disable-next-line
          mainWindow.location.href = mainWindow.location.href;
        },
      });
    }
  }

  static get styles(): CSSResultGroup {
    return [
      HacsStyles,
      css`
        .note {
          margin-top: 12px;
        }
        .lovelace {
          margin-top: 8px;
        }
        pre {
          white-space: pre-line;
          user-select: all;
        }
      `,
    ];
  }
}
