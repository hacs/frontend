import {
  LitElement,
  customElement,
  TemplateResult,
  html,
  property
} from "lit-element";

import { HACS } from "../Hacs";
import { Route } from "../data";

@customElement("hacs-settings")
export class HacsSettings extends LitElement {
  @property() public hacs!: HACS;
  @property() public route!: Route;

  render(): TemplateResult | void {
    if (this.hacs === undefined) {
      return html`
        <hacs-progressbar></hacs-progressbar>
      `;
    }
    return html`
      <hacs-body>
        <hacs-custom-repositories .hacs=${this.hacs} .route=${this.route}>
        </hacs-custom-repositories>
        <hacs-hidden-repositories .hacs=${this.hacs}>
        </hacs-hidden-repositories>
      </hacs-body>
    `;
  }
}
