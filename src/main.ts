import {
  LitElement,
  TemplateResult,
  html,
  customElement,
  property,
  PropertyValues,
} from "lit-element";

import { HomeAssistant } from "custom-card-helpers";
import { Configuration, Route } from "./data/common";
import { getConfiguration } from "./data/websocket";
import { hacsStyleVariables } from "./styles/variables";

import "./hacs-resolver";
import { applyThemesOnElement } from "../frontend/src/common/dom/apply_themes_on_element";

@customElement("hacs-frontend")
class HacsFrontend extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public configuration!: Configuration;

  public async connectedCallback() {
    super.connectedCallback();
    this.configuration = await getConfiguration(this.hass);
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    applyThemesOnElement(
      this.parentElement,
      this.hass.themes,
      this.hass.selectedTheme || this.hass.themes.default_theme
    );
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
