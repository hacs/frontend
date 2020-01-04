import {
  LitElement,
  customElement,
  TemplateResult,
  html,
  property
} from "lit-element";
import {
  RepositoryData,
  Configuration,
  HacsBanner,
  Status,
  Route,
  LovelaceConfig
} from "../data";
import { HACS } from "../Hacs";
import { HomeAssistant } from "custom-card-helpers";

@customElement("hacs-repository-banner-note")
export class RepositoryBannerNote extends LitElement {
  @property({ type: Object }) public hacs!: HACS;
  @property({ type: Object }) public configuration: Configuration;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public lovelaceconfig: LovelaceConfig;
  @property({ type: Object }) public repository!: RepositoryData;
  @property({ type: Object }) public route!: Route;
  @property({ type: Object }) public status!: Status;

  protected render(): TemplateResult | void {
    if (!this.repository.installed) return html``;

    let banner: HacsBanner;

    if (this.repository.category === "integration") {
      if (this.repository.first_install && this.repository.config_flow) {
        banner = document.createElement(
          "hacs-repository-banner-integration-first-install"
        );
        banner.hacs = this.hacs;
        banner.hass = this.hass;
        banner.repository = this.repository;
        banner.route = this.route;
        return html`
          ${banner}
        `;
      } else if (this.repository.status === "pending-restart") {
        banner = document.createElement(
          "hacs-repository-banner-integration-pending-restart"
        );
        banner.hacs = this.hacs;
        banner.hass = this.hass;
        banner.repository = this.repository;
        banner.route = this.route;
        return html`
          ${banner}
        `;
      }
    }

    if (this.repository.category === "plugin") {
      if (this.lovelaceconfig !== undefined && !this.status.background_task) {
        banner = document.createElement(
          "hacs-repository-banner-plugin-not-loaded"
        );
        banner.hacs = this.hacs;
        banner.hass = this.hass;
        banner.configuration = this.configuration;
        banner.lovelaceconfig = this.lovelaceconfig;
        banner.status = this.status;
        banner.repository = this.repository;
        return html`
          ${banner}
        `;
      }
    }
    return html``;
  }
}
