import "@material/mwc-button/mwc-button";
import { mdiArrowRight } from "@mdi/js";
import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { classMap } from "lit/directives/class-map";
import memoizeOne from "memoize-one";
import { mainWindow } from "../../../homeassistant-frontend/src/common/dom/get_main_window";
import { computeRTL } from "../../../homeassistant-frontend/src/common/util/compute_rtl";
import "../../../homeassistant-frontend/src/components/ha-alert";
import "../../../homeassistant-frontend/src/components/ha-circular-progress";
import "../../../homeassistant-frontend/src/components/ha-expansion-panel";
import "../../../homeassistant-frontend/src/components/ha-svg-icon";
import { showConfirmationDialog } from "../../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import { HacsDispatchEvent, Repository } from "../../data/common";
import {
  repositoryInstall,
  repositoryInstallVersion,
  repositoryReleasenotes,
  websocketSubscription,
} from "../../data/websocket";
import { scrollBarStyle } from "../../styles/element-styles";
import { HacsStyles } from "../../styles/hacs-common-style";
import { markdown } from "../../tools/markdown/markdown";
import { updateLovelaceResources } from "../../tools/update-lovelace-resources";
import "../hacs-link";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";

@customElement("hacs-update-dialog")
export class HacsUpdateDialog extends HacsDialogBase {
  @property() public repository!: string;

  @property({ type: Boolean }) private _updating = false;

  @property() private _error?: any;

  @property({ attribute: false }) private _releaseNotes: {
    name: string;
    body: string;
    tag: string;
  }[] = [];

  private _getRepository = memoizeOne((repositories: Repository[], repository: string) =>
    repositories.find((repo) => repo.id === repository)
  );

  protected async firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    const repository = this._getRepository(this.hacs.repositories, this.repository);
    if (!repository) {
      return;
    }

    if (repository.version_or_commit !== "commit") {
      this._releaseNotes = await repositoryReleasenotes(this.hass, repository.id);
      this._releaseNotes = this._releaseNotes.filter(
        (release) => release.tag > repository.installed_version
      );
    }
    websocketSubscription(this.hass, (data) => (this._error = data), HacsDispatchEvent.ERROR);
  }

  protected render(): TemplateResult {
    if (!this.active) return html``;
    const repository = this._getRepository(this.hacs.repositories, this.repository);
    if (!repository) {
      return html``;
    }

    return html`
      <hacs-dialog
        .active=${this.active}
        .title=${this.hacs.localize("dialog_update.title")}
        .hass=${this.hass}
      >
        <div class=${classMap({ content: true, narrow: this.narrow })}>
          <p class="message">
            ${this.hacs.localize("dialog_update.message", { name: repository.name })}
          </p>
          <div class="version-container">
            <div class="version-element">
              <span class="version-number">${repository.installed_version}</span>
              <small class="version-text">${this.hacs.localize(
                "dialog_update.downloaded_version"
              )}</small>
            </div>

            <span class="version-separator">
              <ha-svg-icon
                .path=${mdiArrowRight}
              ></ha-svg-icon>
            </span>

            <div class="version-element">
                <span class="version-number">${repository.available_version}</span>
                <small class="version-text">${this.hacs.localize(
                  "dialog_update.available_version"
                )}</small>
              </div>
            </div>
          </div>

          ${
            this._releaseNotes.length > 0
              ? this._releaseNotes.map(
                  (release) => html`
                    <ha-expansion-panel
                      .header=${release.name && release.name !== release.tag
                        ? `${release.tag}: ${release.name}`
                        : release.tag}
                      outlined
                      ?expanded=${this._releaseNotes.length === 1}
                    >
                      ${release.body
                        ? markdown.html(release.body, repository)
                        : this.hacs.localize("dialog_update.no_info")}
                    </ha-expansion-panel>
                  `
                )
              : ""
          }
          ${
            !repository.can_install
              ? html`<ha-alert alert-type="error" .rtl=${computeRTL(this.hass)}>
                  ${this.hacs.localize("confirm.home_assistant_version_not_correct", {
                    haversion: this.hass.config.version,
                    minversion: repository.homeassistant,
                  })}
                </ha-alert>`
              : ""
          }
          ${
            repository.category === "integration"
              ? html`<p>${this.hacs.localize("dialog_download.restart")}</p>`
              : ""
          }
          ${
            this._error?.message
              ? html`<ha-alert alert-type="error" .rtl=${computeRTL(this.hass)}>
                  ${this._error.message}
                </ha-alert>`
              : ""
          }
        </div>
        <mwc-button
          slot="primaryaction"
          ?disabled=${!repository.can_install}
          @click=${this._updateRepository}
          raised
          >
          ${
            this._updating
              ? html`<ha-circular-progress active size="small"></ha-circular-progress>`
              : this.hacs.localize("common.update")
          }
          </mwc-button
        >
        <div class="secondary" slot="secondaryaction">
          <hacs-link .url=${this._getChanglogURL() || ""}>
            <mwc-button>${this.hacs.localize("dialog_update.changelog")}
          </mwc-button>
          </hacs-link>
          <hacs-link .url="https://github.com/${repository.full_name}">
            <mwc-button>${this.hacs.localize("common.repository")}
          </mwc-button>
          </hacs-link>
        </div>
      </hacs-dialog>
    `;
  }

  private async _updateRepository(): Promise<void> {
    this._updating = true;
    const repository = this._getRepository(this.hacs.repositories, this.repository);
    if (!repository) {
      return;
    }
    if (repository.version_or_commit !== "commit") {
      await repositoryInstallVersion(this.hass, repository.id, repository.available_version);
    } else {
      await repositoryInstall(this.hass, repository.id);
    }
    if (repository.category === "plugin") {
      if (this.hacs.status.lovelace_mode === "storage") {
        await updateLovelaceResources(this.hass, repository, repository.available_version);
      }
    }
    this._updating = false;
    this.dispatchEvent(new Event("hacs-dialog-closed", { bubbles: true, composed: true }));
    if (repository.category === "plugin") {
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

  private _getChanglogURL(): string | undefined {
    const repository = this._getRepository(this.hacs.repositories, this.repository);
    if (!repository) {
      return;
    }

    if (repository.version_or_commit === "commit") {
      return `https://github.com/${repository.full_name}/compare/${repository.installed_version}...${repository.available_version}`;
    }
    return `https://github.com/${repository.full_name}/releases`;
  }

  static get styles(): CSSResultGroup {
    return [
      scrollBarStyle,
      HacsStyles,
      css`
        .content {
          width: 360px;
          display: contents;
        }
        ha-expansion-panel {
          margin: 8px 0;
        }
        ha-expansion-panel[expanded] {
          padding-bottom: 16px;
        }

        .secondary {
          display: flex;
        }
        .message {
          text-align: center;
          margin: 0;
        }
        .version-container {
          margin: 24px 0 12px 0;
          width: 360px;
          min-width: 100%;
          max-width: 100%;
          display: flex;
          flex-direction: row;
        }
        .version-element {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 0 12px;
          text-align: center;
        }
        .version-text {
          color: var(--secondary-text-color);
        }
        .version-number {
          font-size: 1.5rem;
          margin-bottom: 4px;
        }
      `,
    ];
  }
}
