import {
  LitElement,
  TemplateResult,
  html,
  customElement,
  property,
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";
import { HacsLogger } from "./components/HacsLogger";

import { navigate } from "./tools/navigate";

import {
  Route,
  Critical,
  LovelaceResource,
  Status,
  Configuration,
  Repository,
} from "./data/common";

import {
  getRepositories,
  getConfiguration,
  getStatus,
  getCritical,
  getLovelaceConfiguration,
} from "./data/fetch";

import "./panels/hacs-entry-panel";

@customElement("hacs-resolver")
export class HacsResolver extends LitElement {
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public critical!: Critical[];
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public lovelace: LovelaceResource[];
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public repositories: Repository[];
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public status: Status;

  public logger = new HacsLogger();

  public connectedCallback() {
    super.connectedCallback();
    this.addEventListener("hacs-location-changed", this._setRoute);
  }
  protected async firstUpdated() {
    window.onpopstate = function () {
      if (window.location.pathname.includes("hacs")) {
        window.location.reload();
      }
    };
    [
      this.repositories,
      this.configuration,
      this.status,
      this.critical,
      this.lovelace,
    ] = await Promise.all([
      getRepositories(this.hass),
      getConfiguration(this.hass),
      getStatus(this.hass),
      getCritical(this.hass),
      getLovelaceConfiguration(this.hass),
    ]);
  }

  protected render(): TemplateResult | void {
    this._setRoute();
    this.logger.debug(this.route);

    return html`${this.route.path === "/dashboard"
      ? html`<hacs-entry-panel
          .hass=${this.hass}
          .route=${this.route}
          .narrow=${this.narrow}
          .lovelace=${this.lovelace}
          .repositories=${this.repositories}
        ></hacs-entry-panel>`
      : ""}`;
  }

  private _setRoute(): void {
    if (this.route.path === "" || this.route.path === "/") {
      this.route.path = "/dashboard";
    }
    this.logger.debug(this.route);
    navigate(this, this.route.prefix + this.route.path);
    this.requestUpdate();
  }
}
