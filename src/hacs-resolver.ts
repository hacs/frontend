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
  GenericDialogEvent,
} from "./data/common";

import {
  getRepositories,
  getConfiguration,
  getStatus,
  getCritical,
  getLovelaceConfiguration,
} from "./data/fetch";

import "./panels/hacs-entry-panel";
import "./panels/hacs-store-panel";
import "./panels/hacs-settings-panel";
import "./components/dialogs/hacs-generc-dialog";

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

  @property({ attribute: false }) private _genericDialogActive: boolean = false;
  @query("#generic-dialog") private _genericDialog?: any;

  public logger = new HacsLogger();

  public connectedCallback() {
    super.connectedCallback();
    this.addEventListener("hacs-location-changed", (e) =>
      this._setRoute(e as LocationChangedEvent)
    );

    this.addEventListener("hacs-generic-dialog", (e) =>
      this._showGenericDialog(e as GenericDialogEvent)
    );
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
        : this.route.path === "/settings"
        ? html`<hacs-settings-panel
            .hass=${this.hass}
            .route=${this.route}
            .narrow=${this.narrow}
            .configuration=${this.configuration}
            .lovelace=${this.lovelace}
            .repositories=${this.repositories}
          ></hacs-settings-panel>`
        : html`<hacs-store-panel
            .hass=${this.hass}
            .route=${this.route}
            .narrow=${this.narrow}
            .configuration=${this.configuration}
            .lovelace=${this.lovelace}
            .repositories=${this.repositories}
            .section=${this.route.path.split("/")[1]}
          ></hacs-store-panel>`}
      <hacs-generic-dialog
        .hass=${this.hass}
        .narrow=${this.narrow}
        id="generic-dialog"
      ></hacs-generic-dialog> `;
  }

  private _showGenericDialog(ev: GenericDialogEvent): void {
    const dialogParams = ev.detail;
    this._genericDialog.active = true;
    this._genericDialog.header = dialogParams.header || "";
    this._genericDialog.content = dialogParams.content || "";
    this._genericDialog.markdown = dialogParams.markdown || false;
    this.addEventListener(
      "hacs-dialog-closed",
      () => (this._genericDialog.active = false)
    );
  }

  private _setRoute(ev: LocationChangedEvent): void {
    this.route = ev.detail.route;
    navigate(this, this.route.prefix + this.route.path);
    this.requestUpdate();
  }
}
