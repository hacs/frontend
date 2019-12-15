/* eslint-disable no-console, no-undef, prefer-destructuring, prefer-destructuring, no-constant-condition, max-len */
import { HomeAssistant } from "custom-card-helpers";
import {
  css, CSSResultArray, customElement, html, LitElement, property, TemplateResult
} from "lit-element";
import { load_lovelace } from "card-tools/src/hass";
import { navigate } from "./misc/navigate";
import scrollToTarget from "./misc/ScrollToTarget";
import "./panels/corePanel";
import "./panels/_repository";
import "./panels/settings";
import "./panels/installed";
import "./panels/repository";
import "./panels/store";
import "./components/HacsProgressbar";
import "./components/buttons/HacsHelpButton";
import "./misc/HacsError";
import "./misc/HacsCritical";
import { LovelaceConfig } from "./misc/LovelaceTypes";
import { HacsStyle } from "./style/hacs-style";
import {
  Configuration, Repository, Route, Status, Critical, SelectedValue, LocationChangedEvent
} from "./types";

import { localize } from "./localize/localize"


@customElement("hacs-frontendbase")
class HacsFrontendBase extends LitElement {
  @property() public hass!: HomeAssistant;
  @property() public repositories!: Repository[]
  @property() public configuration!: Configuration
  @property() public status!: Status
  @property() public route!: Route;
  @property() public critical!: Critical[];
  @property() public narrow!: boolean;
  @property() public panel!: string;
  @property() public repository: string;
  @property() public repository_view = false;
  @property() public lovelaceconfig: LovelaceConfig;

  public getRepositories(): void {
    this.hass.connection.sendMessagePromise({
      type: "hacs/repositories"
    }).then(
      (resp) => {
        this.repositories = (resp as Repository[]);
        this.requestUpdate();
      },
      (err) => {
        console.error('[hacs/repositories] Message failed!', err);
      }
    );
  }

  public getConfig(): void {
    this.hass.connection.sendMessagePromise({
      type: "hacs/config"
    }).then(
      (resp) => {
        this.configuration = (resp as Configuration);
        this.requestUpdate();
      },
      (err) => {
        console.error('[hacs/config] Message failed!', err);
      }
    );
  }

  public getCritical(): void {
    this.hass.connection.sendMessagePromise({
      type: "hacs/get_critical"
    }).then(
      (resp) => {
        this.critical = (resp as Critical[]);
        this.requestUpdate();
      },
      (err) => {
        console.error('[hacs/get_critical] Message failed!', err);
      }
    );
  }

  public getStatus(): void {
    this.hass.connection.sendMessagePromise({
      type: "hacs/status"
    }).then(
      (resp) => {
        this.status = (resp as Status);
        this.requestUpdate();
      },
      (err) => {
        console.error('[hacs/status] Message failed!', err);
      }
    );
  }

  public getLovelaceConfig(): void {
    this.hass.connection.sendMessagePromise({
      type: 'lovelace/config', force: false
    }).then(
      (resp) => {
        this.lovelaceconfig = (resp as LovelaceConfig);
      },
      () => {
        this.lovelaceconfig = undefined;
      }
    );
  }

  protected firstUpdated() {
    this.addEventListener('hacs-location-change', this.locationChanged)
    window.onpopstate = function () {
      window.location.reload();
    };
    localStorage.setItem("hacs-search", "");
    localStorage.setItem("hacs-sort", "name");
    this.panel = this._page;
    this.getRepositories();
    this.getConfig();
    this.getStatus();
    this.getCritical();
    this.getLovelaceConfig();

    if (/repository\//i.test(this.route.path)) {
      // How fun, this is a repository!
      this.repository_view = true;
      this.repository = this.route.path.split("/")[2];
    } else this.repository_view = false;

    // "steal" LL elements
    load_lovelace();

    // Event subscription
    this.hass.connection.subscribeEvents(
      () => this.getRepositories(), "hacs/repository"
    );

    this.hass.connection.subscribeEvents(
      () => this.getConfig(), "hacs/config"
    );

    this.hass.connection.subscribeEvents(
      () => this.getStatus(), "hacs/status"
    );

    this.hass.connection.subscribeEvents(
      (e) => this._reload(e), "hacs/reload"
    );

    this.hass.connection.subscribeEvents(
      () => this.getLovelaceConfig(), "lovelace_updated"
    );
  }

  _reload(e: any) {
    window.location.reload(e.data.force);
  }


  protected render(): TemplateResult | void {
    // Handle access to root
    if (this.route.path === "" || this.route.path === undefined) {
      navigate(this, `${this.route.prefix}/installed`);
      this.route.path = "/installed"
      this.panel = this.route.path.split("/")[1]
    }
    if (this.panel === "" || this.panel === undefined) {
      navigate(this, `${this.route.prefix}${this.route.path}`);
      this.panel = this.route.path.split("/")[1]
    }

    if (this.repositories === undefined || this.configuration === undefined || this.status === undefined) {
      return html`<div  class="loader"><paper-spinner active></paper-spinner></div>`;
    }

    if (/repository\//i.test(this.route.path)) {
      this.repository_view = true;
      this.repository = this.route.path.split("/")[2];
      this.panel = "repository";
    } else this.repository_view = false;

    const page = this.panel;

    return html`
    <app-header-layout has-scrolling-region>
      <app-header slot="header" fixed>
        <app-toolbar>
        <ha-menu-button .hass="${this.hass}" .narrow="${this.narrow}"></ha-menu-button>
          <div main-title>Home Assistant Community Store
          ${(this._rootPath === "hacs_dev" ? html`(DEVELOPMENT)` : "")}
          </div>
        </app-toolbar>
      <paper-tabs scrollable attr-for-selected="page-name" .selected=${page} @iron-activate=${this.handlePageSelected}>

        <paper-tab page-name="installed">${localize(`common.installed`)}</paper-tab>

        <paper-tab page-name="integration">${localize(`common.integrations`)}</paper-tab>

        <paper-tab page-name="plugin">${localize(`common.plugins`)}</paper-tab>

        ${(this.configuration.appdaemon
        ? html`<paper-tab page-name="appdaemon">
            ${localize(`common.appdaemon_apps`)}
        </paper-tab>` : "")}

        ${(this.configuration.python_script
        ? html`<paper-tab page-name="python_script">
            ${localize(`common.python_scripts`)}
        </paper-tab>` : "")}

        ${(this.configuration.theme
        ? html`<paper-tab page-name="theme">
            ${localize(`common.themes`)}
        </paper-tab>` : "")}

        <paper-tab page-name="settings">${localize("common.settings")}</paper-tab>
      </paper-tabs>
    </app-header>

    <hacs-progressbar .active=${this.status.background_task == true}></hacs-progressbar>
    <slot></slot>

    <hacs-critical .hass=${this.hass} .critical=${this.critical}></hacs-critical>
    <hacs-error .hass=${this.hass}></hacs-error>

    ${(this.route.path === "/installed" ? html`
      <hacs-installed
          .hass=${this.hass}
          .route=${this.route}
          .repositories=${this.repositories}
          .configuration=${this.configuration}
          .status=${this.status}
      ></hacs-installed>
    ` : this.route.path === "/settings" ? html`
        <hacs-settings
            .hass=${this.hass}
            .route=${this.route}
            .repositories=${this.repositories}
            .configuration=${this.configuration}
            .status=${this.status}
        >
        </hacs-settings>
    ` : this.route.path.includes("/repository") ? html`
        <hacs-panel-repository
          .repository=${this._get_repository}
          .hass=${this.hass}
          .route=${this.route}
          .repositories=${this.repositories}
          .configuration=${this.configuration}
          .status=${this.status}
        ></hacs-panel-repository>
    ` : html`
        <hacs-store
          .store=${this._get_store}
          .hass=${this.hass}
          .route=${this.route}
          .repositories=${this.repositories}
          .configuration=${this.configuration}
          .status=${this.status}
        ></hacs-store>
    `)}

    <hacs-help-button></hacs-help-button>

    </app-header-layout>`;
  }

  private get _get_store() {
    return this.route.path.split("/")[1];
  }

  private get _get_repository() {
    return this.route.path.split("/")[2];
  }

  locationChanged(ev): void {
    this.route = ((ev as LocationChangedEvent).detail.value)
    navigate(this, `${this.route.prefix}${this.route.path}`);
    this.requestUpdate();
  }

  handlePageSelected(e: SelectedValue) {
    this.repository_view = false;
    const newPage = e.detail.selected;
    this.panel = newPage;
    this.route.path = `/${newPage}`;
    navigate(this, `${this.route.prefix}${this.route.path}`);
    scrollToTarget(

      this,
      // @ts-ignore
      this.shadowRoot!.querySelector("app-header-layout").header.scrollTarget
    );
  }

  private get _page() {
    if (this.route.path.split("/")[1] === undefined) return "installed";
    return this.route.path.split("/")[1];
  }

  private get _rootPath() {
    if (this.route.prefix.split("/")[1] === undefined) return "hacs";
    return this.route.prefix.split("/")[1];
  }

  static get styles(): CSSResultArray {
    return [HacsStyle, css`
    app-header-layout {
      background: var(--lovelace-background, var(--primary-background-color));
    }
    .loader {
      background-color: var(--primary-background-color);
      height: 100%;
      width: 100%;
    }
    paper-spinner {
      position: absolute;
      top: 30%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 99;
      width: 150px;
      height: 150px;
   }
    `];
  }
}
