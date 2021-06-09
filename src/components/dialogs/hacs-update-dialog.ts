import "@material/mwc-button/mwc-button";
import "../../../homeassistant-frontend/src/components/ha-expansion-panel";
import { mdiArrowRight } from "@mdi/js";
import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { classMap } from "lit/directives/class-map";
import memoizeOne from "memoize-one";
import "../../../homeassistant-frontend/src/components/ha-circular-progress";
import "../../../homeassistant-frontend/src/components/ha-svg-icon";
import { Repository } from "../../data/common";
import {
  repositoryInstall,
  repositoryInstallVersion,
  repositoryReleasenotes,
} from "../../data/websocket";
import { scrollBarStyle } from "../../styles/element-styles";
import { markdown } from "../../tools/markdown/markdown";
import { updateLovelaceResources } from "../../tools/update-lovelace-resources";
import "../hacs-link";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";

@customElement("hacs-update-dialog")
export class HacsUpdateDialog extends HacsDialogBase {
  @property() public repository?: string;
  @property() private _updating: boolean = false;
  @property() private _error?: any;
  @property() private _releaseNotes: { name: string; body: string; tag: string }[] = [];

  private _getRepository = memoizeOne((repositories: Repository[], repository: string) =>
    repositories?.find((repo) => repo.id === repository)
  );

  protected async firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    const repository = this._getRepository(this.repositories, this.repository);
    if (repository.version_or_commit !== "commit") {
      this._releaseNotes = await repositoryReleasenotes(this.hass, repository.id);
      this._releaseNotes = this._releaseNotes.filter(
        (release) => release.tag > repository.installed_version
      );
    }
    this.hass.connection.subscribeEvents((msg) => (this._error = (msg as any).data), "hacs/error");
  }

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const repository = this._getRepository(this.repositories, this.repository);
    return html`
      <hacs-dialog
        .active=${this.active}
        .title=${this.hacs.localize("dialog_update.title")}
        .hass=${this.hass}
      >
        <div class=${classMap({ content: true, narrow: this.narrow })}>
          <p class="message">
            ${this.hacs.localize("dialog_update.message").replace("{name}", repository.name)}
          </p>
          <div class="version-container">
            <div class="version-element">
              <span class="version-number">${repository.installed_version}</span>
              <small class="version-text">${this.hacs.localize(
                "dialog_update.installed_version"
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
                    <ha-expansion-panel .header=${release.name || release.tag} outlined>
                      ${markdown.html(release.body)}
                    </ha-expansion-panel>
                  `
                )
              : ""
          }
          ${
            !repository.can_install
              ? html`<p class="error">
                  ${this.hacs
                    .localize("confirm.home_assistant_version_not_correct")
                    .replace("{haversion}", this.hass.config.version)
                    .replace("{minversion}", repository.homeassistant)}
                </p>`
              : ""
          }
          ${
            repository.category === "integration"
              ? html`<p>${this.hacs.localize("dialog_install.restart")}</p>`
              : ""
          }
          ${this._error ? html`<div class="error">${this._error.message}</div>` : ""}
        </div>
        <mwc-button
          slot="primaryaction"
          ?disabled=${!repository.can_install}
          @click=${this._updateRepository}
          >${
            this._updating
              ? html`<ha-circular-progress active></ha-circular-progress>`
              : this.hacs.localize("common.update")
          }</mwc-button
        >
        <div class="secondary" slot="secondaryaction">
          <hacs-link .url=${this._getChanglogURL()}
            ><mwc-button>${this.hacs.localize("dialog_update.changelog")}</mwc-button></hacs-link
          >
          <hacs-link .url="https://github.com/${repository.full_name}"
            ><mwc-button>${this.hacs.localize("common.repository")}</mwc-button></hacs-link
          >
        </div>
      </hacs-dialog>
    `;
  }

  private async _updateRepository(): Promise<void> {
    this._updating = true;
    const repository = this._getRepository(this.repositories, this.repository);
    if (repository.version_or_commit !== "commit") {
      await repositoryInstallVersion(this.hass, repository.id, repository.available_version);
    } else {
      await repositoryInstall(this.hass, repository.id);
    }
    if (repository.category === "plugin") {
      if (this.hacs.status.lovelace_mode === "storage") {
        await updateLovelaceResources(this.hass, repository);
      }
    }
    this._updating = false;
    this.dispatchEvent(new Event("hacs-dialog-closed", { bubbles: true, composed: true }));
    if (repository.category === "plugin") {
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

  private _getChanglogURL(): string {
    const repository = this._getRepository(this.repositories, this.repository);
    if (repository.version_or_commit === "commit") {
      return `https://github.com/${repository.full_name}/compare/${repository.installed_version}...${repository.available_version}`;
    }
    return `https://github.com/${repository.full_name}/releases`;
  }

  static get styles(): CSSResultGroup {
    return [
      scrollBarStyle,
      css`
        .content {
          width: 360px;
          display: contents;
        }
        .error {
          color: var(--hacs-error-color, var(--google-red-500));
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
