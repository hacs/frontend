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
  @property() public hacs!: HACS;
  @property() public configuration: Configuration;
  @property() public hass!: HomeAssistant;
  @property() public lovelaceconfig: LovelaceConfig;
  @property() public repository!: RepositoryData;
  @property() public route!: Route;
  @property() public status!: Status;

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
