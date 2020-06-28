import { css, CSSResultArray, customElement, html, TemplateResult, property } from "lit-element";
import memoizeOne from "memoize-one";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-listbox/paper-listbox";
import { classMap } from "lit-html/directives/class-map";
import { scrollBarStyle } from "../../styles/element-styles";
import {
  repositoryInstall,
  repositoryInstallVersion,
  repositoryReleasenotes,
} from "../../data/websocket";
import { updateLovelaceResources } from "../../tools/update-lovelace-resources";
import { HacsDialogBase } from "./hacs-dialog-base";
import { Repository } from "../../data/common";
import { localize } from "../../localize/localize";
import { markdown } from "../../tools/markdown/markdown";

import "./hacs-dialog";
import "../hacs-link";

@customElement("hacs-update-dialog")
export class HacsUpdateDialog extends HacsDialogBase {
  @property() public repository?: string;
  @property() private _updating: boolean = false;
  @property() private _error?: any;
  @property() private _releaseNotes: { tag: string; body: string }[] = [];

  private _getRepository = memoizeOne((repositories: Repository[], repository: string) =>
    repositories?.find((repo) => repo.id === repository)
  );

  protected async firstUpdated() {
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
        .title=${localize("dialog_update.title")}
        .hass=${this.hass}
      >
        <div class=${classMap({ content: true, narrow: this.narrow })}>
          ${repository.name}
          <p>
            <b>${localize("dialog_update.installed_version")}:</b>
            ${repository.installed_version}
          </p>
          <p>
            <b>${localize("dialog_update.available_version")}:</b>
            ${repository.available_version}
          </p>
          ${this._releaseNotes.length > 0
            ? this._releaseNotes.map(
                (release) => html`<details>
                  <summary
                    >${localize("dialog_update.releasenotes").replace(
                      "{release}",
                      release.tag
                    )}</summary
                  >
                  ${markdown.html(release.body)}
                </details>`
              )
            : ""}
          ${!repository.can_install
            ? html`<p class="error">
                ${localize("confirm.home_assistant_version_not_correct")
                  .replace("{haversion}", this.hass.config.version)
                  .replace("{minversion}", repository.homeassistant)}
              </p>`
            : ""}
          ${repository.category === "integration"
            ? html`<p>${localize("dialog_install.restart")}</p>`
            : ""}
          ${this._error ? html`<div class="error">${this._error.message}</div>` : ""}
        </div>
        <mwc-button
          slot="primaryaction"
          ?disabled=${!repository.can_install}
          @click=${this._updateRepository}
          >${this._updating
            ? html`<paper-spinner active></paper-spinner>`
            : localize("common.update")}</mwc-button
        >
        <hacs-link slot="secondaryaction" .url=${this._getChanglogURL()}
          ><mwc-button>${localize("dialog_update.changelog")}</mwc-button></hacs-link
        >
        <hacs-link slot="secondaryaction" .url="https://github.com/${repository.full_name}"
          ><mwc-button>${localize("common.repository")}</mwc-button></hacs-link
        >
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
      if (this.status.lovelace_mode === "storage") {
        await updateLovelaceResources(this.hass, repository);
      }
      window.location.reload(true);
    }
    this._updating = false;
    this.dispatchEvent(new Event("hacs-dialog-closed", { bubbles: true, composed: true }));
  }

  private _getChanglogURL(): string {
    const repository = this._getRepository(this.repositories, this.repository);
    if (repository.version_or_commit === "commit") {
      return `https://github.com/${repository.full_name}/compare/${repository.installed_version}...${repository.available_version}`;
    }
    return `https://github.com/${repository.full_name}/releases`;
  }

  static get styles(): CSSResultArray {
    return [
      scrollBarStyle,
      css`
        .content {
          padding: 32px 8px;
        }
        .error {
          color: var(--hacs-error-color, var(--google-red-500));
        }
        details {
          padding: 12px 0;
        }
        summary {
          padding: 4px;
          cursor: pointer;
        }
      `,
    ];
  }
}
