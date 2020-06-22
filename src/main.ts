import {
  LitElement,
  TemplateResult,
  html,
  customElement,
  property,
  PropertyValues,
} from "lit-element";

import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import { Configuration, LocationChangedEvent } from "./data/common";
import { getConfiguration } from "./data/websocket";
import { hacsStyleVariables } from "./styles/variables";
import { HacsStyles } from "./styles/hacs-common-style";

import "./hacs-router";

import { navigate } from "../homeassistant-frontend/src/common/navigate";
import { applyThemesOnElement } from "../homeassistant-frontend/src/common/dom/apply_themes_on_element";

@customElement("hacs-frontend")
class HacsFrontend extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public configuration!: Configuration;

  public async connectedCallback() {
    super.connectedCallback();
    this.configuration = await getConfiguration(this.hass);

    this.addEventListener("hacs-location-changed", (e) =>
      this._setRoute(e as LocationChangedEvent)
    );
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    applyThemesOnElement(
      this.parentElement,
      this.hass.themes,
      this.hass.selectedTheme || this.hass.themes.default_theme
    );
    if (this.route.path === "") {
      navigate(this, "/hacs/entry", true);
    }
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this.configuration) return html``;
    return html`
      <hacs-router
        .hass=${this.hass}
        .route=${this.route}
        .narrow=${this.narrow}
        .configuration=${this.configuration}
      ></hacs-router>
    `;
  }
  static get styles() {
    return [HacsStyles, hacsStyleVariables];
  }

  private _setRoute(ev: LocationChangedEvent): void {
    this.route = ev.detail.route;
    navigate(this, this.route.path, true);
    this.requestUpdate();
  }
}
