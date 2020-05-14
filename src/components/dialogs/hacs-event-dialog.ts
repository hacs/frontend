import {
  query,
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";

import "./hacs-generic-dialog";
import "./hacs-about-dialog";
import "./hacs-update-dialog";

@customElement("hacs-event-dialog")
export class HacsEventDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public params!: any;
  @property({ type: Boolean }) public narrow!: boolean;
  @property({ type: Boolean }) public active: boolean = false;

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const el: any = document.createElement(
      `hacs-${this.params.type || "generic"}-dialog`
    );
    el.active = true;
    el.hass = this.hass;
    el.narrow = this.narrow;
    if (this.params) {
      for (let [key, value] of Object.entries(this.params)) {
        el[key] = value;
      }
    }
    return html`${el}`;
  }
}
