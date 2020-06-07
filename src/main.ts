import { LitElement, TemplateResult, html, customElement, property } from "lit-element";
import { load_lovelace } from "card-tools/src/hass";
import { HomeAssistant } from "custom-card-helpers";
import { Configuration, Route } from "./data/common";
import { getConfiguration } from "./data/websocket";
import { hacsStyleVariables } from "./styles/variables";

import "./hacs-resolver";

@customElement("hacs-frontend")
class HacsFrontend extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public configuration!: Configuration;

  public async connectedCallback() {
    super.connectedCallback();
    load_lovelace();
    this.configuration = await getConfiguration(this.hass);
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this.configuration) return html``;
    return html`
      <hacs-resolver
        .hass=${this.hass}
        .route=${this.route}
        .narrow=${this.narrow}
        .configuration=${this.configuration}
      ></hacs-resolver>
    `;
  }
  static get styles() {
    return hacsStyleVariables;
  }
}
