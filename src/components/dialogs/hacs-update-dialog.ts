import {
  css,
  CSSResultArray,
  customElement,
  html,
  TemplateResult,
  property,
} from "lit-element";
import memoizeOne from "memoize-one";

import {
  repositoryInstall,
  repositoryInstallVersion,
} from "../../data/websocket";
import { HacsDialogBase } from "./hacs-dialog-base";
import { Repository } from "../../data/common";
import { localize } from "../../localize/localize";

import "./hacs-dialog";

@customElement("hacs-update-dialog")
export class HacsUpdateDialog extends HacsDialogBase {
  @property() public repository?: string;
  @property() private _updating: boolean = false;

  private _getRepository = memoizeOne(
    (repositories: Repository[], repository: string) =>
      repositories?.find((repo) => repo.id === repository)
  );

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const repository = this._getRepository(this.repositories, this.repository);
    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
        dynamicHeight
      >
        <div slot="header">${localize("dialog_update.title")}</div>
        <div class="content">
          ${repository.name}
          <p>
            <b>${localize("dialog_update.installed_version")}:</b>
            ${repository.installed_version}
          </p>
          <p>
            <b>${localize("dialog_update.available_version")}:</b>
            ${repository.available_version}
          </p>
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
        </div>
        <div slot="actions">
          <mwc-button
            ?disabled=${!repository.can_install}
            @click=${this._updateRepository}
            >${this._updating
              ? html`<paper-spinner active></paper-spinner>`
              : localize("common.update")}</mwc-button
          >
          <hacs-link .url=${this._getChanglogURL()}
            ><mwc-button
              >${localize("dialog_update.changelog")}</mwc-button
            ></hacs-link
          >
          <hacs-link .url="https://github.com/${repository.full_name}"
            ><mwc-button
              >${localize("common.repository")}</mwc-button
            ></hacs-link
          >
        </div>
      </hacs-dialog>
    `;
  }

  private async _updateRepository(): Promise<void> {
    this._updating = true;
    const repository = this._getRepository(this.repositories, this.repository);
    if (repository.version_or_commit !== "commit") {
      await repositoryInstallVersion(
        this.hass,
        repository.id,
        repository.available_version
      );
    } else {
      await repositoryInstall(this.hass, repository.id);
    }
    if (repository.category === "plugin") {
      window.location.reload(true);
    }
    this._updating = false;
    this.dispatchEvent(
      new Event("hacs-dialog-closed", { bubbles: true, composed: true })
    );
  }

  private _getChanglogURL(): string {
    const repository = this._getRepository(this.repositories, this.repository);
    if (repository.version_or_commit === "commit") {
      return `https://github.com/${repository.full_name}/compare/${repository.installed_version}...${repository.available_version}`;
    }
    return `https://github.com/${repository.full_name}/releases/${repository.available_version}`;
  }

  static get styles(): CSSResultArray {
    return [
      css`
        .content {
          padding: 32px 8px;
        }
        .error {
          color: var(--hacs-error-color, var(--google-red-500));
        }
      `,
    ];
  }
}
