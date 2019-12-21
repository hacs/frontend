import {
  LitElement,
  customElement,
  TemplateResult,
  html,
  property
} from "lit-element";

import { HomeAssistant } from "custom-card-helpers";
import { HACS } from "../Hacs";

import { Configuration, Repository, Status, Route } from "../types";

@customElement("hacs-settings")
export class HacsSettings extends LitElement {
  @property({ type: Array }) public repositories!: Repository[];
  @property({ type: Object }) public configuration!: Configuration;
  @property({ type: Object }) public hacs!: HACS;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public status!: Status;
  @property({ type: Object }) public route!: Route;

  render(): TemplateResult | void {
    if (
      this.hass === undefined ||
      this.repositories === undefined ||
      this.configuration === undefined ||
      this.status === undefined
    ) {
      return html`
        <hacs-progressbar></hacs-progressbar>
      `;
    }
    return html`
      <hacs-body>
        <hacs-custom-repositories
          .hass=${this.hass}
          .status=${this.status}
          .route=${this.route}
          .configuration=${this.configuration}
          .repositories=${this.repositories}
        >
        </hacs-custom-repositories>
        <hacs-hidden-repositories
          .hass=${this.hass}
          .status=${this.status}
          .configuration=${this.configuration}
          .repositories=${this.repositories}
        >
        </hacs-hidden-repositories>
      </hacs-body>
    `;
  }
}
