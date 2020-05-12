import {
  LitElement,
  customElement,
  property,
  html,
  css,
  TemplateResult,
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";

import "../layout/hacs-tabbed-layout";

import { sections } from "./hacs-sections";

@customElement("hacs-store-panel")
export class HacsStorePanel extends LitElement {
  @property({ type: Object }) public hass!: HomeAssistant;

  protected render(): TemplateResult | void {
    return html`<hacs-tabbed-layout
      .hass=${this.hass}
      .tabs="${sections.panels}"
    ></hacs-tabbed-layout>`;
  }

  static get styles() {
    return css``;
  }
}
