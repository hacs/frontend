/* eslint-disable no-console, no-undef, prefer-destructuring, prefer-destructuring, no-constant-condition, max-len */
import { HomeAssistant } from "custom-card-helpers";
import {
  css,
  CSSResultArray,
  customElement,
  html,
  LitElement,
  property,
  PropertyValues,
  TemplateResult
} from "lit-element";
import { HACS, Hacs } from "./Hacs";
import { HacsStyle } from "./style/hacs-style";

import {
  Configuration,
  RepositoryData,
  Route,
  Status,
  Critical,
  SelectedValue,
  LocationChangedEvent,
  LovelaceConfig,
  RepositoryActionData
} from "./types";

import { load_lovelace } from "card-tools/src/hass";
import { Logger } from "./misc/Logger";

@customElement("hacs-frontendbase")
class HacsFrontendBase extends LitElement {
  @property({ type: Array }) public critical!: Critical[];
  @property({ type: Boolean }) public narrow!: boolean;
  @property({ type: Boolean }) public repository_view: boolean = false;
  @property({ type: Object }) public hacs!: HACS;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public lovelaceconfig: LovelaceConfig;
  @property({ type: Object }) public route!: Route;

  public logger = new Logger();

  attributeChangedCallback(name, oldVal, newVal) {
    console.log("attribute change: ", name, newVal);
    super.attributeChangedCallback(name, oldVal, newVal);
  }

  protected update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
    this.hacs.logger.info(changedProperties);
  }

  public connectedCallback() {
    /* I have no idea why this is done, but without it shit breaks */
    super.connectedCallback();

    /* Create the HACS object */
    this.hacs = new Hacs(this.configuration, this.repositories, this.status);

    /* Add handlers for custom HACS browser events */
    this.addEventListener("hacs-location-change", this.locationChanged);
    this.addEventListener("hacs-repository-action", this.RepositoryAction);
    this.addEventListener("hacs-onboarding-done", this.onboardingDone);
    this.addEventListener("hacs-recreate", this._recreatehacs);
    this.addEventListener("hacs-force-reload", this._reload);

    /* "steal" Lovelace elements */
    load_lovelace();

    /* Backend event subscription */
    this.hass.connection.subscribeEvents(() => this.getConfig(), "hacs/config");
    this.hass.connection.subscribeEvents(() => this.getStatus(), "hacs/status");
    this.hass.connection.subscribeEvents(e => this._reload(e), "hacs/reload");
    this.hass.connection.subscribeEvents(
      () => this.getRepos(),
      "hacs/repository"
    );
    this.hass.connection.subscribeEvents(
      () => this.getLovelaceConfig(),
      "lovelace_updated"
    );

    /* Reset local storage */
    localStorage.setItem("hacs-search", "");
    localStorage.setItem("hacs-sort", "name-desc");
  }

  status: Status;
  configuration: Configuration;
  repositories: RepositoryData[];

  private _recreatehacs(): void {
    var configuration = this.configuration;
    var repositories = this.repositories;
    var status = this.status;
    if (this.hacs.isnullorempty(configuration))
      configuration = this.hacs.configuration;
    if (this.hacs.isnullorempty(repositories))
      repositories = this.hacs.repositories;
    if (this.hacs.isnullorempty(status)) status = this.hacs.status;
    this.hacs = new Hacs(configuration, repositories, status);
    this.requestUpdate();
  }

  private RepositoryAction(ev): void {
    if (this.configuration.debug) this.hacs.logger.info(ev.detail);
    const evdata: RepositoryActionData = ev.detail;
    this.hacs.RepositoryWebSocketAction(
      this.hass,
      evdata.repo,
      evdata.action,
      evdata.category
    );
  }

  public getRepos(): void {
    this.hass.connection
      .sendMessagePromise({
        type: "hacs/repositories"
      })
      .then(
        resp => {
          this.repositories = resp as RepositoryData[];
          this._recreatehacs();
        },
        err => {
          this.logger.error("(hacs/repositories) Message failed!");
          this.logger.error(err);
        }
      );
  }

  public getConfig(): void {
    this.hass.connection
      .sendMessagePromise({
        type: "hacs/config"
      })
      .then(
        resp => {
          this.configuration = resp as Configuration;
          this._recreatehacs();
        },
        err => {
          this.logger.error("(hacs/config) Message failed!");
          this.logger.error(err);
        }
      );
  }

  public getCritical(): void {
    this.hass.connection
      .sendMessagePromise({
        type: "hacs/get_critical"
      })
      .then(
        resp => {
          this.critical = resp as Critical[];
          this._recreatehacs();
        },
        err => {
          this.logger.error("(hacs/get_critical) Message failed!");
          this.logger.error(err);
        }
      );
  }

  public getStatus(): void {
    this.hass.connection
      .sendMessagePromise({
        type: "hacs/status"
      })
      .then(
        resp => {
          this.status = resp as Status;
          this._recreatehacs();
        },
        err => {
          this.logger.error("(hacs/status) Message failed!");
          this.logger.error(err);
        }
      );
  }

  public getLovelaceConfig(): void {
    this.hass.connection
      .sendMessagePromise({
        type: "lovelace/config",
        force: false
      })
      .then(
        resp => {
          this.lovelaceconfig = resp as LovelaceConfig;
        },
        () => {
          this.lovelaceconfig = undefined;
        }
      );
  }

  protected firstUpdated() {
    window.onpopstate = function() {
      window.location.reload();
    };
    this.getRepos();
    this.getConfig();
    this.getStatus();
    this.getCritical();
    this.getLovelaceConfig();
  }

  _reload(e: any) {
    const force =
      (e.data && e.data.force) || (e.detail && e.detail.force) || false;
    window.location.reload(force);
  }

  protected render(): TemplateResult | void {
    // Handle access to root
    if (this.route.path === "" || this.route.path === undefined) {
      this.hacs.navigate(this, `${this.route.prefix}/installed`);
      this.route.path = "/installed";
    }

    if (
      this.repositories === undefined ||
      this.configuration === undefined ||
      this.status === undefined
    ) {
      return html`
        <div class="loader"><paper-spinner active></paper-spinner></div>
      `;
    }

    if (
      (!this.configuration.onboarding_done && !this.status.disabled) ||
      false
    ) {
      return html`
        <hacs-onboarding
          .hacs=${this.hacs}
          .hass=${this.hass}
          .narrow=${this.narrow}
        ></hacs-onboarding>
      `;
    }

    return html`
      <app-header-layout has-scrolling-region>
        <app-header slot="header" fixed>
          <div id="contentContainer">
            <app-toolbar>
              <ha-menu-button
                .hass="${this.hass}"
                .narrow="${this.narrow}"
              ></ha-menu-button>
              <div main-title class="fulltitle">
                Home Assistant Community Store
                ${this._rootPath === "hacs_dev"
                  ? html`
                      (DEVELOPMENT)
                    `
                  : ""}
              </div>
              <div main-title class="mobiletitle">
                HACS
                ${this._rootPath === "hacs_dev"
                  ? html`
                      (DEVELOPMENT)
                    `
                  : ""}
              </div>
              <hacs-menu
                .location=${window.location.pathname}
                .hacs=${this.hacs}
                .hass=${this.hass}
                .configuration=${this.configuration}
                .status=${this.status}
                .repositories=${this.repositories}
              ></hacs-menu>
            </app-toolbar>

            <paper-tabs
              scrollable
              autoselect
              class="tabs"
              attr-for-selected="page-name"
              .selected=${this._activeTab}
              @iron-activate=${this.handlePageSelected}
            >
              <paper-tab page-name="installed"
                >${this.hacs.localize(`common.installed`)}</paper-tab
              >

              <paper-tab page-name="integration"
                >${this.hacs.localize(`common.integrations`)}</paper-tab
              >

              <paper-tab page-name="plugin"
                >${this.hacs.localize(`common.plugins`)}</paper-tab
              >

              ${this.configuration.categories.includes("appdaemon")
                ? html`
                    <paper-tab page-name="appdaemon">
                      ${this.hacs.localize(`common.appdaemon_apps`)}
                    </paper-tab>
                  `
                : ""}
              ${this.configuration.categories.includes("python_script")
                ? html`
                    <paper-tab page-name="python_script">
                      ${this.hacs.localize(`common.python_scripts`)}
                    </paper-tab>
                  `
                : ""}
              ${this.configuration.categories.includes("theme")
                ? html`
                    <paper-tab page-name="theme">
                      ${this.hacs.localize(`common.themes`)}
                    </paper-tab>
                  `
                : ""}
              <paper-tab page-name="settings"
                >${this.hacs.localize("common.settings")}</paper-tab
              >
            </paper-tabs>
          </div>
        </app-header>

        <hacs-progressbar
          .active=${this.status.background_task || this.status.disabled}
        ></hacs-progressbar>
        ${this.status.disabled
          ? html`
              <ha-card header="${this.hacs
                .localize("common.disabled")
                .toUpperCase()}!">
                <div class="card-content">
                  ${this.hacs.localize(
                    "common.hacs_is_disabled"
                  )}! </br> ${this.hacs.localize("common.check_log_file")}
                </div>
              </ha-card>
            `
          : ""}
        <hacs-body>
          <hacs-critical
            .hacs=${this.hacs}
            .hass=${this.hass}
            .critical=${this.critical}
          ></hacs-critical>
          <hacs-error .hacs=${this.hacs} .hass=${this.hass}></hacs-error>

          ${this.route.path === "/installed"
            ? html`
                <hacs-installed
                  .hacs=${this.hacs}
                  .hass=${this.hass}
                  .route=${this.route}
                  .lovelaceconfig=${this.lovelaceconfig}
                  .repositories=${this.repositories}
                  .configuration=${this.configuration}
                  .status=${this.status}
                ></hacs-installed>
              `
            : this.route.path === "/settings"
            ? html`
                <hacs-settings
                  .hacs=${this.hacs}
                  .hass=${this.hass}
                  .route=${this.route}
                >
                </hacs-settings>
              `
            : this.route.path.includes("/repository")
            ? html`
                <hacs-repository
                  .hacs=${this.hacs}
                  .repository=${this._get_repository}
                  .hass=${this.hass}
                  .route=${this.route}
                  .lovelaceconfig=${this.lovelaceconfig}
                  .repositories=${this.repositories}
                  .configuration=${this.configuration}
                  .status=${this.status}
                ></hacs-repository>
              `
            : html`
                <hacs-store
                  .hacs=${this.hacs}
                  .store=${this._get_store}
                  .hass=${this.hass}
                  .route=${this.route}
                  .repositories=${this.repositories}
                  .configuration=${this.configuration}
                  .status=${this.status}
                ></hacs-store>
              `}
        </hacs-body>
      </app-header-layout>
    `;
  }

  private get _get_store() {
    return this.route.path.split("/")[1];
  }

  private get _get_repository() {
    return this.route.path.split("/")[2];
  }

  locationChanged(ev: any): void {
    if (this.configuration.debug) this.hacs.logger.info(ev.type, ev.detail);
    this.route.path = `/${(ev as LocationChangedEvent).detail.value}`;
    const force = (ev as LocationChangedEvent).detail.force;
    this.hacs.navigate(this, `${this.route.prefix}${this.route.path}`);
    if (force) window.location.reload();
    else this.requestUpdate();
    this.hacs.scrollToTarget(
      this,
      // @ts-ignore
      this.shadowRoot!.querySelector("app-header-layout").header.scrollTarget
    );
  }

  onboardingDone(): void {
    this.configuration.onboarding_done = true;
    this.hass.connection.sendMessage({
      type: "hacs/settings",
      action: "onboarding_done"
    });
    this.requestUpdate();
  }

  handlePageSelected(e: SelectedValue) {
    this.dispatchEvent(
      new CustomEvent("hacs-location-change", {
        detail: { value: e.detail.selected },
        bubbles: true,
        composed: true
      })
    );
  }

  private get _activeTab() {
    if (this.route.path.split("/")[1] === undefined) return "installed";
    return this.route.path.split("/")[1];
  }

  private get _rootPath() {
    if (this.route.prefix.split("/")[1] === undefined) return "hacs";
    return this.route.prefix.split("/")[1];
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`
        app-header-layout {
          background: var(
            --lovelace-background,
            var(--primary-background-color)
          );
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
        paper-tab {
          cursor: pointer;
        }

        .margin {
          width: 20%;
        }
        hacs-progressbar {
          top: 0;
          position: sticky;
          display: block;
          z-index: 1337;
        }
        .fulltitle {
          display: block;
        }
        .mobiletitle {
          display: none;
        }
        @media screen and (max-width: 612px) and (min-width: 0) {
          .fulltitle {
            display: none;
          }
          .mobiletitle {
            display: block;
            margin-left: 24px;
          }
        }
      `
    ];
  }
}
