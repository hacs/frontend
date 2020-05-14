import {
  css,
  CSSResultArray,
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";

import { Repository } from "../../data/common";
import {
  repositoryInstall,
  repositoryInstallVersion,
} from "../../data/websocket";
import { HomeAssistant } from "custom-card-helpers";
import "./hacs-dialog";

@customElement("hacs-update-dialog")
export class HacsUpdateDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public repository!: Repository;
  @property({ attribute: false }) public loading: boolean = true;
  @property({ attribute: false }) public active: boolean = false;

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
      >
        <div slot="header">Update pending</div>
        <div class="content">
          New update for ${this.repository.name}
          <p><b>Installed version:</b> ${this.repository.installed_version}</p>
          <p><b>Available version:</b> ${this.repository.available_version}</p>
        </div>
        <div class="card-actions">
          <mwc-button @click=${this._updateRepository}>Update</mwc-button>
          <hacs-link .url=${this._getChanglogURL()}
            ><mwc-button>Changelog</mwc-button></hacs-link
          >
          <hacs-link .url="https://github.com/${this.repository.full_name}"
            ><mwc-button>Repository</mwc-button></hacs-link
          >
        </div>
      </hacs-dialog>
    `;
  }

  private async _updateRepository(): Promise<void> {
    this.dispatchEvent(
      new Event("hacs-dialog-closed", { bubbles: true, composed: true })
    );
    if (
      this.repository.version_or_commit !== "commit" &&
      this.repository.selected_tag !== this.repository.available_version
    ) {
      await repositoryInstallVersion(
        this.hass,
        this.repository.id,
        this.repository.available_version
      );
    } else {
      await repositoryInstall(this.hass, this.repository.id);
    }
  }

  private _getChanglogURL(): string {
    if (this.repository.version_or_commit === "commit") {
      return `https://github.com/${this.repository.full_name}/compare/${this.repository.installed_version}...${this.repository.available_version}`;
    }
    return `https://github.com/${this.repository.full_name}/releases/${this.repository.available_version}`;
  }

  static get styles(): CSSResultArray {
    return [
      css`
        .content {
          padding: 32px 8px;
      `,
    ];
  }
}
