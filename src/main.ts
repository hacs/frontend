import { customElement, html, property, query, TemplateResult } from "lit-element";
import { atLeastVersion } from "../homeassistant-frontend/src/common/config/version";
import { applyThemesOnElement } from "../homeassistant-frontend/src/common/dom/apply_themes_on_element";
import { navigate } from "../homeassistant-frontend/src/common/navigate";
import { makeDialogManager } from "../homeassistant-frontend/src/dialogs/make-dialog-manager";
import { ProvideHassLitMixin } from "../homeassistant-frontend/src/mixins/provide-hass-lit-mixin";
import "../homeassistant-frontend/src/resources/ha-style";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "./components/dialogs/hacs-event-dialog";
import {
  Configuration,
  Critical,
  HacsDialogEvent,
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
import { HacsElement } from "./hacs";
import "./hacs-router";
import { HacsStyles } from "./styles/hacs-common-style";
import { hacsStyleVariables } from "./styles/variables";

@customElement("hacs-frontend")
class HacsFrontend extends ProvideHassLitMixin(HacsElement) {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public critical!: Critical[];
  @property({ attribute: false }) public lovelace: LovelaceResource[];
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public removed: RemovedRepository[];
  @property({ attribute: false }) public repositories: Repository[];
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public status: Status;

  @query("#hacs-dialog") private _hacsDialog?: any;
  @query("#hacs-dialog-secondary") private _hacsDialogSecondary?: any;

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    this.addEventListener("hacs-location-changed", (e) =>
      this._setRoute(e as LocationChangedEvent)
    );

    this.addEventListener("hacs-dialog", (e) => this._showDialog(e as HacsDialogEvent));
    this.addEventListener("hacs-dialog-secondary", (e) =>
      this._showDialogSecondary(e as HacsDialogEvent)
    );

    this.hass.connection.subscribeEvents(
      async () => await this._updateProperties("configuration"),
      "hacs/config"
    );
    this.hass.connection.subscribeEvents(
      async () => await this._updateProperties("status"),
      "hacs/status"
    );
    this.hass.connection.subscribeEvents(
      async () => await this._updateProperties("status"),
      "hacs/stage"
    );
    this.hass.connection.subscribeEvents(
      async () => await this._updateProperties("repositories"),
      "hacs/repository"
    );
    this.hass.connection.subscribeEvents(
      async () => await this._updateProperties("lovelace"),
      "lovelace_updated"
    );

    makeDialogManager(this, this.shadowRoot!);
    this._updateProperties();
    if (this.route.path === "") {
      navigate(this, "/hacs/entry", true);
    }

    this._applyTheme();
  }

  private async _updateProperties(prop: string = "all") {
    let repositories: Repository[];
    const _updates: any = {};
    const _fetch: any = {};

    if (prop === "all") {
      [
        repositories,
        _fetch.configuration,
        _fetch.status,
        _fetch.critical,
        _fetch.resources,
        _fetch.removed,
      ] = await Promise.all([
        getRepositories(this.hass),
        getConfiguration(this.hass),
        getStatus(this.hass),
        getCritical(this.hass),
        getLovelaceConfiguration(this.hass),
        getRemovedRepositories(this.hass),
      ]);

      //this.removed = removed;
      //this.critical = critical;
      this.lovelace = _fetch.resources;
      this.repositories = repositories;
    } else if (prop === "configuration") {
      _fetch.configuration = await getConfiguration(this.hass);
    } else if (prop === "status") {
      _fetch.status = await getStatus(this.hass);
    } else if (prop === "repositories") {
      this.repositories = await getRepositories(this.hass);
    } else if (prop === "lovelace") {
      _fetch.resources = await getLovelaceConfiguration(this.hass);
    }

    Object.keys(_fetch).forEach((update) => {
      if (_fetch[update] !== undefined) {
        _updates[update] = _fetch[update];
      }
    });
    if (_updates) {
      this._updateHacs(_updates);
    }
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this.hacs) return html``;
    return html`
      <hacs-router
        .hass=${this.hass}
        .hacs=${this.hacs}
        .route=${this.route}
        .narrow=${this.narrow}
        .configuration=${this.configuration}
        .lovelace=${this.lovelace}
        .status=${this.status}
        .critical=${this.critical}
        .removed=${this.removed}
        .repositories=${this.repositories}
      ></hacs-router>
      <hacs-event-dialog
        .hass=${this.hass}
        .hacs=${this.hacs}
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
        .hacs=${this.hacs}
        .route=${this.route}
        .narrow=${this.narrow}
        .configuration=${this.configuration}
        .lovelace=${this.lovelace}
        .status=${this.status}
        .removed=${this.removed}
        .repositories=${this.repositories}
        id="hacs-dialog-secondary"
      ></hacs-event-dialog>
    `;
  }
  static get styles() {
    return [HacsStyles, hacsStyleVariables];
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
    this.route = ev.detail.route;
    navigate(this, this.route.path, true);
    this.requestUpdate();
  }

  private _applyTheme() {
    let themeName: string;
    let options: Partial<HomeAssistant["selectedTheme"]> | undefined;

    if (atLeastVersion(this.hass.config.version, 0, 114)) {
      themeName =
        this.hass.selectedTheme?.theme ||
        (this.hass.themes.darkMode && this.hass.themes.default_dark_theme
          ? this.hass.themes.default_dark_theme!
          : this.hass.themes.default_theme);

      options = this.hass.selectedTheme;
      if (themeName === "default" && options?.dark === undefined) {
        options = {
          ...this.hass.selectedTheme,
          dark: this.hass.themes.darkMode,
        };
      }
    } else {
      themeName =
        ((this.hass.selectedTheme as unknown) as string) || this.hass.themes.default_theme;
    }

    applyThemesOnElement(this.parentElement, this.hass.themes, themeName, options);
    this.parentElement.style.backgroundColor = "var(--primary-background-color)";
  }
}
