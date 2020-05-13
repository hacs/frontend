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

import "./hacs-dialog";

@customElement("hacs-update-dialog")
export class HacsUpdateDialog extends LitElement {
  @property({ attribute: false }) public repository!: Repository;
  @property({ attribute: false }) public loading: boolean = true;
  @property({ attribute: false }) public active: boolean = false;

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    return html`
      <hacs-dialog .active=${this.active}>
        <div slot="header">Update pending</div>
        <div class="content">
          New update for ${this.repository.name}
          <p><b>Installed version:</b> ${this.repository.installed_version}</p>
          <p><b>Available version:</b> ${this.repository.available_version}</p>
        </div>
        <div class="card-actions">
          <mwc-button>Update</mwc-button>
          <hacs-link .url="https://github.com/${this.repository.full_name}"
            ><mwc-button>Repository</mwc-button></hacs-link
          >
          <mwc-button>Changelog</mwc-button>
        </div>
      </hacs-dialog>
    `;
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
