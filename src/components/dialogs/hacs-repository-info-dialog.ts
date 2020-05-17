import {
  customElement,
  html,
  TemplateResult,
  property,
  css,
} from "lit-element";
import memoizeOne from "memoize-one";

import { HacsDialogBase } from "./hacs-dialog-base";
import { Repository } from "../../data/common";
import { markdown } from "../../legacy/markdown/markdown";

import { repositoryUpdate } from "../../data/websocket";

@customElement("hacs-repository-info-dialog")
export class HacsRepositoryDialog extends HacsDialogBase {
  @property() public repository?: string;

  private _getRepository = memoizeOne(
    (repositories: Repository[], repository: string) =>
      repositories?.find((repo) => repo.id === repository)
  );

  protected async firstUpdated() {
    const repository = this._getRepository(this.repositories, this.repository);
    if (!repository.updated_info) {
      await repositoryUpdate(this.hass, repository.id);
    }
  }

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const repository = this._getRepository(this.repositories, this.repository);
    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
        .secondary=${this.secondary}
      >
        <div slot="header">${repository.name || ""}</div>
        ${repository.updated_info
          ? markdown.html(
              repository.additional_info ||
                "The developer has not provided any more information for this repository",
              repository
            )
          : "Loading information..."}
        ${!repository.installed && repository.updated_info
          ? html` <div slot="actions">
              <mwc-button @click=${this._installRepository} raised
                >Install this repository in HACS</mwc-button
              >
            </div>`
          : ""}
      </hacs-dialog>
    `;
  }
  static get styles() {
    return css`
      img {
        max-width: 100%;
      }
    `;
  }

  private async _installRepository(): Promise<void> {
    const repository = this._getRepository(this.repositories, this.repository);
    this.dispatchEvent(
      new CustomEvent("hacs-dialog-secondary", {
        detail: {
          type: "install",
          repository: repository.id,
        },
        bubbles: true,
        composed: true,
      })
    );
  }
}
