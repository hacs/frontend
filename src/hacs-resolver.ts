import {
  LitElement,
  TemplateResult,
  html,
  customElement,
  query,
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
  LocationChangedEvent,
  HacsDialogEvent,
} from "./data/common";

import {
  getRepositories,
  getConfiguration,
  getStatus,
  getCritical,
  getLovelaceConfiguration,
} from "./data/websocket";

import "./panels/hacs-entry-panel";
import "./panels/hacs-store-panel";
import "./panels/hacs-settings-panel";

import "./components/dialogs/hacs-event-dialog";

@customElement("hacs-resolver")
export class HacsResolver extends LitElement {
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public critical!: Critical[];
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public lovelace: LovelaceResource[];
  @property({ type: Boolean }) public narrow!: boolean;
  @property({ attribute: false }) public repositories: Repository[];
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public status: Status;

  @query("#hacs-dialog") private _hacsDialog?: any;

  public logger = new HacsLogger();

  public connectedCallback() {
    super.connectedCallback();
    this.addEventListener("hacs-location-changed", (e) =>
      this._setRoute(e as LocationChangedEvent)
    );

    this.addEventListener("hacs-dialog", (e) =>
      this._showDialog(e as HacsDialogEvent)
    );
  }

  protected async firstUpdated() {
    window.onpopstate = function () {
      if (window.location.pathname.includes("hacs")) {
        window.location.reload();
      }
    };

    /* Backend event subscription */
    this.hass.connection.subscribeEvents(
      () => this._updateProperties(),
      "hacs/config"
    );
    this.hass.connection.subscribeEvents(
      () => this._updateProperties(),
      "hacs/status"
    );

    this.hass.connection.subscribeEvents(
      () => this._updateProperties(),
      "hacs/repository"
    );
    this.hass.connection.subscribeEvents(
      () => this._updateProperties(),
      "lovelace_updated"
    );
    await this._updateProperties();
  }

  private async _updateProperties() {
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
    if (this.route.path === "" || this.route.path === "/") {
      this.route.path = "/dashboard";
    }

    return html`${this.route.path === "/dashboard"
        ? html`<hacs-entry-panel
            .hass=${this.hass}
            .route=${this.route}
            .narrow=${this.narrow}
            .configuration=${this.configuration}
            .lovelace=${this.lovelace}
            .repositories=${this.repositories}
          ></hacs-entry-panel>`
        : html`<hacs-store-panel
            .hass=${this.hass}
            .route=${this.route}
            .narrow=${this.narrow}
            .configuration=${this.configuration}
            .lovelace=${this.lovelace}
            .repositories=${this.repositories}
            .section=${this.route.path.split("/")[1]}
          ></hacs-store-panel>`}
      <hacs-event-dialog
        .hass=${this.hass}
        .route=${this.route}
        .narrow=${this.narrow}
        .configuration=${this.configuration}
        .lovelace=${this.lovelace}
        .repositories=${this.repositories}
        id="hacs-dialog"
      ></hacs-event-dialog>`;
  }

  private _showDialog(ev: HacsDialogEvent): void {
    const dialogParams = ev.detail;
    this._hacsDialog.active = true;
    this._hacsDialog.params = dialogParams;
    this.addEventListener(
      "hacs-dialog-closed",
      () => (this._hacsDialog.active = false)
    );
  }

  private _setRoute(ev: LocationChangedEvent): void {
    this.route = ev.detail.route;
    navigate(this, this.route.prefix + this.route.path);
    this.requestUpdate();
  }
}
