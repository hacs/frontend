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

import { markdown } from "../../legacy/markdown/markdown";

import "./hacs-dialog";

@customElement("hacs-repository-info-dialog")
export class HacsRepositoryInfoDialog extends LitElement {
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public repository!: Repository;
  @property({ attribute: false }) public loading: boolean = true;
  @property({ attribute: false }) public active: boolean = false;

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    return html`
      <hacs-dialog .active=${this.active} .narrow=${this.narrow}>
        <div slot="header">${this.repository.name}</div>
        ${markdown.html(
          this.repository.additional_info ||
            "No additional information is given by the developer",
          this.repository
        )}
      </hacs-dialog>
    `;
  }

  static get styles(): CSSResultArray {
    return [css``];
  }
}
