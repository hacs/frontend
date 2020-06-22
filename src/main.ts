import {
  customElement,
  html,
  LitElement,
  property,
  PropertyValues,
  TemplateResult,
} from "lit-element";
import memoizeOne from "memoize-one";

import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import {
  Configuration,
  Critical,
  LocationChangedEvent,
  LovelaceResource,
  RemovedRepository,
  Repository,
  Status,
} from "./data/common";
import {
  getConfiguration,
  getCritical,
  getLovelaceConfiguration,
  getRemovedRepositories,
  getRepositories,
  getStatus,
} from "./data/websocket";
import { hacsStyleVariables } from "./styles/variables";
import { HacsStyles } from "./styles/hacs-common-style";

import "./hacs-router";

import { navigate } from "../homeassistant-frontend/src/common/navigate";
import { applyThemesOnElement } from "../homeassistant-frontend/src/common/dom/apply_themes_on_element";

@customElement("hacs-frontend")
class HacsFrontend extends LitElement {
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public critical!: Critical[];
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public lovelace: LovelaceResource[];
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public removed: RemovedRepository[];
  @property({ attribute: false }) public repositories: Repository[];
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public status: Status;

  public async connectedCallback() {
    super.connectedCallback();
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
        .lovelace=${this.lovelace}
        .status=${this.status}
        .critical=${this.critical}
        .removed=${this.removed}
        .repositories=${this.repositories}
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

  private _sortRepositoriesByName = memoizeOne((repositories: Repository[]) =>
    repositories.sort((a: Repository, b: Repository) =>
      a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    )
  );
}
