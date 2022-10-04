import { css, html, PropertyValues, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators";
import { applyThemesOnElement } from "../homeassistant-frontend/src/common/dom/apply_themes_on_element";
import { mainWindow } from "../homeassistant-frontend/src/common/dom/get_main_window";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import "../homeassistant-frontend/src/layouts/hass-loading-screen";
import { isNavigationClick } from "../homeassistant-frontend/src/common/dom/is-navigation-click";
import { navigate } from "../homeassistant-frontend/src/common/navigate";
import { makeDialogManager } from "../homeassistant-frontend/src/dialogs/make-dialog-manager";
import "../homeassistant-frontend/src/resources/ha-style";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "./components/dialogs/hacs-event-dialog";
import { HacsDialogEvent, HacsDispatchEvent, LocationChangedEvent } from "./data/common";
import {
  fetchHacsInfo,
  getCritical,
  getLovelaceConfiguration,
  getRemovedRepositories,
  getRepositories,
  websocketSubscription,
} from "./data/websocket";
import { HacsElement } from "./hacs";
import "./hacs-router";
import { HacsStyles } from "./styles/hacs-common-style";
import { hacsStyleVariables } from "./styles/variables";

@customElement("hacs-frontend")
class HacsFrontend extends HacsElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public narrow!: boolean;

  @property({ attribute: false }) public route!: Route;

  @query("#hacs-dialog") private _hacsDialog?: any;

  @query("#hacs-dialog-secondary") private _hacsDialogSecondary?: any;

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);

    this._applyTheme();

    this.hacs.language = this.hass.language;
    this.addEventListener("hacs-location-changed", (e) =>
      this._setRoute(e as LocationChangedEvent)
    );

    this.addEventListener("hacs-dialog", (e) => this._showDialog(e as HacsDialogEvent));
    this.addEventListener("hacs-dialog-secondary", (e) =>
      this._showDialogSecondary(e as HacsDialogEvent)
    );

    websocketSubscription(
      this.hass,
      () => this._updateProperties("configuration"),
      HacsDispatchEvent.CONFIG
    );

    websocketSubscription(
      this.hass,
      () => this._updateProperties("status"),
      HacsDispatchEvent.STATUS
    );

    websocketSubscription(
      this.hass,
      () => this._updateProperties("status"),
      HacsDispatchEvent.STAGE
    );

    websocketSubscription(
      this.hass,
      () => this._updateProperties("repositories"),
      HacsDispatchEvent.REPOSITORY
    );

    this.hass.connection.subscribeEvents(
      async () => this._updateProperties("lovelace"),
      "lovelace_updated"
    );
    this._updateProperties();
    if (this.route.path === "") {
      navigate("/hacs/entry", { replace: true });
    }

    window.addEventListener("haptic", (ev) => {
      // @ts-ignore
      fireEvent(window.parent, ev.type, ev.detail, {
        bubbles: false,
      });
    });

    document.body.addEventListener("click", (ev) => {
      const href = isNavigationClick(ev);
      if (href) {
        navigate(href);
      }
    });

    mainWindow.addEventListener("location-changed", (ev) =>
      // @ts-ignore
      fireEvent(this, ev.type, ev.detail, {
        bubbles: false,
      })
    );

    document.body.addEventListener("keydown", (ev: KeyboardEvent) => {
      if (ev.ctrlKey || ev.shiftKey || ev.metaKey || ev.altKey) {
        // Ignore if modifier keys are pressed
        return;
      }
      if (["c", "e"].includes(ev.key)) {
        // @ts-ignore
        fireEvent(mainWindow, "hass-quick-bar-trigger", ev, {
          bubbles: false,
        });
      }
    });

    mainWindow
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (_) => this._applyTheme());

    makeDialogManager(this, this.shadowRoot!);
  }

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
    if (!oldHass) {
      return;
    }
    if (oldHass.themes !== this.hass.themes) {
      this._applyTheme();
    }
  }

  private async _updateProperties(prop = "all") {
    const _updates: any = {};
    const _fetch: any = {};

    if (prop === "all") {
      [_fetch.repositories, _fetch.info, _fetch.critical, _fetch.resources, _fetch.removed] =
        await Promise.all([
          getRepositories(this.hass),
          fetchHacsInfo(this.hass),
          getCritical(this.hass),
          getLovelaceConfiguration(this.hass),
          getRemovedRepositories(this.hass),
        ]);
    } else if (prop === "info") {
      _fetch.info = await fetchHacsInfo(this.hass);
    } else if (prop === "repositories") {
      _fetch.repositories = await getRepositories(this.hass);
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
      this.requestUpdate();
    }
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this.hacs?.info.categories?.length) {
      return html`<hass-loading-screen no-toolbar></hass-loading-screen>`;
    }

    return html`
      <hacs-router
        .hass=${this.hass}
        .hacs=${this.hacs}
        .route=${this.route}
        .narrow=${this.narrow}
      ></hacs-router>
      <hacs-event-dialog
        .hass=${this.hass}
        .hacs=${this.hacs}
        .route=${this.route}
        .narrow=${this.narrow}
        id="hacs-dialog"
      ></hacs-event-dialog>
      <hacs-event-dialog
        .hass=${this.hass}
        .hacs=${this.hacs}
        .route=${this.route}
        .narrow=${this.narrow}
        id="hacs-dialog-secondary"
      ></hacs-event-dialog>
    `;
  }

  static get styles() {
    return [
      HacsStyles,
      hacsStyleVariables,
      css`
        hass-loading-screen {
          height: 100vh;
        }
      `,
    ];
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
    if (!ev.detail?.route) {
      return;
    }
    this.route = ev.detail.route;
    navigate(this.route.path, { replace: true });
    this.requestUpdate();
  }

  private _applyTheme() {
    applyThemesOnElement(
      this.parentElement,
      this.hass.themes,
      this.hass.selectedTheme?.theme ||
        (this.hass.themes.darkMode && this.hass.themes.default_dark_theme
          ? this.hass.themes.default_dark_theme!
          : this.hass.themes.default_theme),
      {
        ...this.hass.selectedTheme,
        dark: this.hass.themes.darkMode,
      }
    );
    this.parentElement!.style.backgroundColor = "var(--primary-background-color)";
    this.parentElement!.style.color = "var(--primary-text-color)";
  }
}
