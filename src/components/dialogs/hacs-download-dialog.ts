import "@material/mwc-button/mwc-button";
import "@material/mwc-linear-progress/mwc-linear-progress";
import { css, CSSResultGroup, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { fireEvent } from "../../../homeassistant-frontend/src/common/dom/fire_event";
import { mainWindow } from "../../../homeassistant-frontend/src/common/dom/get_main_window";
import { computeRTL } from "../../../homeassistant-frontend/src/common/util/compute_rtl";
import "../../../homeassistant-frontend/src/components/ha-alert";
import "../../../homeassistant-frontend/src/components/ha-button";
import "../../../homeassistant-frontend/src/components/ha-dialog";
import "../../../homeassistant-frontend/src/components/ha-form/ha-form";
import { HaFormSchema } from "../../../homeassistant-frontend/src/components/ha-form/types";
import { showConfirmationDialog } from "../../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import type { HomeAssistant } from "../../../homeassistant-frontend/src/types";
import { HacsDispatchEvent } from "../../data/common";
import {
  fetchRepositoryInformation,
  RepositoryBase,
  repositoryDownloadVersion,
  RepositoryInfo,
  repositorySetVersion,
} from "../../data/repository";
import { repositoryBeta, websocketSubscription } from "../../data/websocket";
import { HacsStyles } from "../../styles/hacs-common-style";
import { generateFrontendResourceURL, updateFrontendResource } from "../../tools/frontend-resource";
import type { HacsDownloadDialogParams } from "./show-hacs-dialog";
import { documentationUrl } from "../../tools/documentation";

@customElement("hacs-download-dialog")
export class HacsDonwloadDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _waiting = true;

  @state() private _installing = false;

  @state() private _error?: any;

  @state() public _repository?: RepositoryInfo;

  @state() _dialogParams?: HacsDownloadDialogParams;

  public async showDialog(dialogParams: HacsDownloadDialogParams): Promise<void> {
    this._dialogParams = dialogParams;
    this._waiting = false;
    if (dialogParams.repository) {
      this._repository = dialogParams.repository;
    } else {
      await this._fetchRepository();
    }

    websocketSubscription(
      this.hass,
      (data) => {
        this._error = data;
        this._installing = false;
      },
      HacsDispatchEvent.ERROR,
    );
    await this.updateComplete;
  }

  public closeDialog(): void {
    this._dialogParams = undefined;
    this._repository = undefined;
    this._error = undefined;
    this._installing = false;
    this._waiting = false;
    fireEvent(this, "dialog-closed", { dialog: this.localName });
  }

  private _getInstallPath = memoizeOne((repository: RepositoryBase) => {
    let path: string = repository.local_path;
    if (["template", "theme", "python_script"].includes(repository.category)) {
      path = `${path}/${repository.file_name}`;
    }
    return path;
  });

  private async _fetchRepository() {
    this._repository = await fetchRepositoryInformation(
      this.hass,
      this._dialogParams!.repositoryId,
    );
  }

  protected render() {
    if (!this._dialogParams || !this._repository) {
      return nothing;
    }

    const installPath = this._getInstallPath(this._repository);
    const selectedVersion =
      this._repository.selected_tag ||
      this._repository.available_version ||
      this._repository.default_branch;
    const donwloadRepositorySchema: HaFormSchema[] = [
      {
        name: "beta",
        selector: { boolean: {} },
      },
      {
        name: "version",
        selector: {
          select: {
            options: this._repository.releases.concat(
              this._repository.full_name === "hacs/integration" ||
                this._repository.hide_default_branch
                ? []
                : [this._repository.default_branch],
            ),
            mode: "dropdown",
          },
        },
      },
    ];
    return html`
      <ha-dialog
        open
        scrimClickAction
        escapeKeyAction
        .heading=${this._repository.name}
        @closed=${this.closeDialog}
      >
        <div class="content">
          ${this._repository.version_or_commit === "version" && this._repository.installed
            ? html`
                <ha-form
                  .disabled=${this._waiting}
                  .data=${this._repository.version_or_commit === "version"
                    ? {
                        beta: this._repository.beta,
                        version: selectedVersion,
                      }
                    : {}}
                  .schema=${donwloadRepositorySchema}
                  .computeLabel=${(schema: HaFormSchema) =>
                    schema.name === "beta"
                      ? this._dialogParams!.hacs.localize("dialog_download.show_beta")
                      : this._dialogParams!.hacs.localize("dialog_download.select_version")}
                  @value-changed=${this._valueChanged}
                >
                </ha-form>
                <ha-alert alert-type="info" .rtl=${computeRTL(this.hass)}>
                  ${this._dialogParams!.hacs.localize("dialog_download.selector_note")}
                  <a
                    class="learn_more"
                    href=${documentationUrl({
                      path: "/docs/entities/update_entities#install-service",
                      experimental: this._dialogParams!.hacs.info.experimental,
                    })}
                    slot="action"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ${this._dialogParams!.hacs.localize("common.learn_more")}</a
                  >
                </ha-alert>
              `
            : nothing}
          ${!this._repository.can_download
            ? html`<ha-alert alert-type="error" .rtl=${computeRTL(this.hass)}>
                ${this._dialogParams.hacs.localize("confirm.home_assistant_version_not_correct", {
                  haversion: this.hass.config.version,
                  minversion: this._repository.homeassistant,
                })}
              </ha-alert>`
            : ""}
          <div class="note">
            ${this._dialogParams.hacs.localize("dialog_download.note_downloaded", {
              location: html`<code>'${installPath}'</code>`,
            })}
            ${this._repository.category === "plugin" &&
            this._dialogParams.hacs.info.lovelace_mode !== "storage"
              ? html`
                  <p>${this._dialogParams.hacs.localize(`dialog_download.lovelace_instruction`)}</p>
                  <pre>
                url: ${generateFrontendResourceURL({ repository: this._repository, skipTag: true })}
                type: module
                </pre
                  >
                `
              : nothing}
            ${this._repository.category === "integration"
              ? html`<p>${this._dialogParams.hacs.localize("dialog_download.restart")}</p>`
              : nothing}
          </div>
          ${this._error?.message
            ? html`<ha-alert alert-type="error" .rtl=${computeRTL(this.hass)}>
                ${this._error.message}
              </ha-alert>`
            : nothing}
          ${this._installing
            ? html`<mwc-linear-progress indeterminate></mwc-linear-progress>`
            : nothing}
        </div>
        <mwc-button slot="secondaryAction" @click=${this.closeDialog} dialogInitialFocus>
          ${this._dialogParams.hacs.localize("common.cancel")}
        </mwc-button>
        <mwc-button
          slot="primaryAction"
          ?disabled=${!this._repository.can_download || this._waiting || this._installing}
          @click=${this._installRepository}
        >
          ${this._dialogParams.hacs.localize("common.download")}
        </mwc-button>
      </ha-dialog>
    `;
  }

  private async _valueChanged(ev) {
    let updateNeeded = false;
    if (this._repository!.beta !== ev.detail.value.beta) {
      updateNeeded = true;
      this._waiting = true;
      await repositoryBeta(this.hass, this._dialogParams!.repositoryId, ev.detail.value.beta);
    }
    if (ev.detail.value.version) {
      updateNeeded = true;
      this._waiting = true;

      await repositorySetVersion(
        this.hass,
        this._dialogParams!.repositoryId,
        ev.detail.value.version,
      );
    }
    if (updateNeeded) {
      await this._fetchRepository();
      this._waiting = false;
    }
  }

  private async _installRepository(): Promise<void> {
    if (!this._repository) {
      return;
    }

    if (this._waiting) {
      this._error = "Waiting to update repository information, try later.";
      return;
    }

    if (this._installing) {
      this._error = "Already installing, please wait.";
      return;
    }

    if (!this._repository.can_download) {
      this._error = "Can not download this repository.";
      return;
    }

    this._installing = true;
    this._error = undefined;

    const selectedVersion =
      this._repository.selected_tag ||
      this._repository.available_version ||
      this._repository.default_branch;

    try {
      await repositoryDownloadVersion(
        this.hass,
        String(this._repository.id),
        this._repository?.version_or_commit !== "commit" ? selectedVersion : undefined,
      );
    } catch (err: any) {
      this._error = err || {
        message: "Could not download repository, check core logs for more information.",
      };
      this._installing = false;
      return;
    }

    this._dialogParams!.hacs.log.debug(this._repository.category, "_installRepository");
    this._dialogParams!.hacs.log.debug(
      this._dialogParams!.hacs.info.lovelace_mode,
      "_installRepository",
    );
    if (
      this._repository.category === "plugin" &&
      this._dialogParams!.hacs.info.lovelace_mode === "storage"
    ) {
      await updateFrontendResource(this.hass, this._repository, selectedVersion);
    }
    this._installing = false;

    if (this._repository.category === "plugin") {
      showConfirmationDialog(this, {
        title: this._dialogParams!.hacs.localize!("common.reload"),
        text: html`${this._dialogParams!.hacs.localize!("dialog.reload.description")}<br />${this
            ._dialogParams!.hacs.localize!("dialog.reload.confirm")}`,
        dismissText: this._dialogParams!.hacs.localize!("common.cancel"),
        confirmText: this._dialogParams!.hacs.localize!("common.reload"),
        confirm: () => {
          // eslint-disable-next-line
          mainWindow.location.href = mainWindow.location.href;
        },
      });
    }
    if (this._error === undefined) {
      this.closeDialog();
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
        .learn_more {
          color: var(--hcv-text-color-primary);
        }
        pre {
          white-space: pre-line;
          user-select: all;
        }
        mwc-linear-progress {
          margin-bottom: -8px;
          margin-top: 4px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hacs-download-dialog": HacsDonwloadDialog;
  }
}
