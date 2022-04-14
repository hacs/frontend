import { LitElement, TemplateResult, html } from "lit";
import { customElement, property, query } from "lit/decorators";
import memoizeOne from "memoize-one";

import { HomeAssistant } from "../homeassistant-frontend/src/types";

import {
  Route,
  Critical,
  LovelaceResource,
  Status,
  Configuration,
  Repository,
  LocationChangedEvent,
  HacsDialogEvent,
  RemovedRepository,
  HacsDispatchEvent,
} from "./data/common";

import {
  getRepositories,
  getConfiguration,
  getStatus,
  getCritical,
  getLovelaceConfiguration,
  getRemovedRepositories,
  websocketSubscription,
} from "./data/websocket";

import "./panels/hacs-entry-panel";
import "./panels/hacs-store-panel";

import "./components/dialogs/hacs-event-dialog";
import { navigate } from "../homeassistant-frontend/src/common/navigate";

@customElement("hacs-resolver")
export class HacsResolver extends LitElement {
  @property({ attribute: false }) public configuration!: Configuration;

  @property({ attribute: false }) public critical!: Critical[];

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public lovelace!: LovelaceResource[] | null;

  @property({ type: Boolean }) public narrow!: boolean;

  @property({ attribute: false }) public repositories!: Repository[];

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public status!: Status;

  @property({ attribute: false }) public removed!: RemovedRepository[];

  @query("#hacs-dialog") private _hacsDialog?: any;

  @query("#hacs-dialog-secondary") private _hacsDialogSecondary?: any;

  private _sortRepositoriesByName = memoizeOne((repositories: Repository[]) =>
    repositories.sort((a: Repository, b: Repository) =>
      a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    )
  );

  public connectedCallback() {
    super.connectedCallback();
    this.addEventListener("hacs-location-changed", (e) =>
      this._setRoute(e as LocationChangedEvent)
    );

    this.addEventListener("hacs-dialog", (e) => this._showDialog(e as HacsDialogEvent));
    this.addEventListener("hacs-dialog-secondary", (e) =>
      this._showDialogSecondary(e as HacsDialogEvent)
    );
  }

  protected async firstUpdated() {
    window.onpopstate = function () {
      if (window.location.pathname.includes("hacs")) {
        window.location.reload();
      }
    };

    /* Backend event subscription */
    websocketSubscription(this.hass, () => this._updateProperties(), HacsDispatchEvent.CONFIG);
    websocketSubscription(this.hass, () => this._updateProperties(), HacsDispatchEvent.STATUS);
    websocketSubscription(this.hass, () => this._updateProperties(), HacsDispatchEvent.REPOSITORY);
    this.hass.connection.subscribeEvents(async () => this._updateProperties(), "lovelace_updated");

    await this._updateProperties();
  }

  private async _updateProperties() {
    const [repositories, configuration, status, critical, lovelace, removed] = await Promise.all([
      getRepositories(this.hass),
      getConfiguration(this.hass),
      getStatus(this.hass),
      getCritical(this.hass),
      getLovelaceConfiguration(this.hass),
      getRemovedRepositories(this.hass),
    ]);

    this.configuration = configuration;
    this.status = status;
    this.removed = removed;
    this.critical = critical;
    this.lovelace = lovelace;
    this.configuration = configuration;
    this.repositories = this._sortRepositoriesByName(repositories);
  }

  protected render(): TemplateResult | void {
    if (this.route.path === "" || this.route.path === "/") {
      this.route.path = "/dashboard";
    }

    return html`${["/integrations", "/frontend", "/automation"].includes(this.route.path)
        ? html`<hacs-store-panel
            .hass=${this.hass}
            .route=${this.route}
            .narrow=${this.narrow}
            .configuration=${this.configuration}
            .lovelace=${this.lovelace}
            .repositories=${this.repositories}
            .status=${this.status}
            .removed=${this.removed}
            .section=${this.route.path.split("/")[1]}
          ></hacs-store-panel>`
        : html`<hacs-entry-panel
            .hass=${this.hass}
            .route=${this.route}
            .narrow=${this.narrow}
            .configuration=${this.configuration}
            .lovelace=${this.lovelace}
            .status=${this.status}
            .removed=${this.removed}
            .repositories=${this.repositories}
          ></hacs-entry-panel>`}
      <hacs-event-dialog
        .hass=${this.hass}
        .route=${this.route}
        .narrow=${this.narrow}
        .configuration=${this.configuration}
        .lovelace=${this.lovelace}
        .status=${this.status}
        .removed=${this.removed}
        .repositories=${this.repositories}
        id="hacs-dialog"
      ></hacs-event-dialog>
      <hacs-event-dialog
        .hass=${this.hass}
        .route=${this.route}
        .narrow=${this.narrow}
        .configuration=${this.configuration}
        .lovelace=${this.lovelace}
        .status=${this.status}
        .removed=${this.removed}
        .repositories=${this.repositories}
        id="hacs-dialog-secondary"
      ></hacs-event-dialog>`;
  }

  private _showDialog(ev: HacsDialogEvent): void {
    const dialogParams = ev.detail;
    this._hacsDialog.active = true;
    this._hacsDialog.params = dialogParams;
    this.addEventListener("hacs-dialog-closed", () => (this._hacsDialog.active = false));
  }

  private _showDialogSecondary(ev: HacsDialogEvent): void {
    const dialogParams = ev.detail;
    this._hacsDialogSecondary.active = true;
    this._hacsDialogSecondary.secondary = true;
    this._hacsDialogSecondary.params = dialogParams;
    this.addEventListener(
      "hacs-secondary-dialog-closed",
      () => (this._hacsDialogSecondary.active = false)
    );
  }

  private _setRoute(ev: LocationChangedEvent): void {
    this.route = ev.detail!.route;
    navigate(this.route.prefix + this.route.path);
    this.requestUpdate();
  }
}
