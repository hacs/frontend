import {
  LitElement,
  customElement,
  TemplateResult,
  html,
  property
} from "lit-element";

import { HomeAssistant } from "custom-card-helpers";
import { HACS } from "../Hacs";

import { Route } from "../types";

@customElement("hacs-settings")
export class HacsSettings extends LitElement {
  @property({ type: Object }) public hacs!: HACS;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public route!: Route;

  render(): TemplateResult | void {
    if (
      this.hass === undefined ||
      this.hacs.repositories === undefined ||
      this.hacs.configuration === undefined ||
      this.hacs.status === undefined
    ) {
      return html`
        <hacs-progressbar></hacs-progressbar>
      `;
    }
    return html`
      <hacs-body>
        <hacs-custom-repositories
          .hacs=${this.hacs}
          .hass=${this.hass}
          .status=${this.hacs.status}
          .route=${this.route}
        >
        </hacs-custom-repositories>
        <hacs-hidden-repositories
          .hacs=${this.hacs}
          .hass=${this.hass}
          .status=${this.hacs.status}
        >
        </hacs-hidden-repositories>
      </hacs-body>
    `;
  }
}
