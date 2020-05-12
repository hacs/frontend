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

@customElement("hacs-repository-info-dialog")
export class HacsRepositoryInfoDialog extends LitElement {
  @property() public repository!: Repository;
  @property() public loading: boolean = true;
  @property() public active: boolean = false;

  protected render(): TemplateResult | void {
    return html`
      <hacs-dialog .active=${this.active}>
        <div slot="header">${this.repository.name}</div>
        ${this.repository.info}
      </hacs-dialog>
    `;
  }

  static get styles(): CSSResultArray {
    return [css``];
  }
}
