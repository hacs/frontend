import {
  css,
  CSSResultArray,
  customElement,
  html,
  TemplateResult,
  property,
} from "lit-element";

import {
  repositoryInstall,
  repositoryInstallVersion,
} from "../../data/websocket";
import { HacsDialogBase } from "./hacs-dialog-base";
import { selectRepository } from "../../data/common";
import "./hacs-dialog";

@customElement("hacs-install-dialog")
export class HacsInstallDialog extends HacsDialogBase {
  @property() public repository?: string;

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const repository = selectRepository(this.repositories, this.repository);
    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
        .secondary=${this.secondary}
      >
        <div slot="header">${repository.name}</div>
        <div class="content"></div>
        <div slot="actions">
          <mwc-button @click=${this._installRepository}>Install</mwc-button>

          <hacs-link .url="https://github.com/${repository.full_name}"
            ><mwc-button>Repository</mwc-button></hacs-link
          >
        </div>
      </hacs-dialog>
    `;
  }

  private async _installRepository(): Promise<void> {
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
    const repository = selectRepository(this.repositories, this.repository);
    if (
      repository.version_or_commit !== "commit" &&
      repository.selected_tag !== repository.available_version
    ) {
      await repositoryInstallVersion(
        this.hass,
        repository.id,
        repository.available_version
      );
    } else {
      await repositoryInstall(this.hass, repository.id);
    }
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
