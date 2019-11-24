import {
  LitElement,
  customElement,
  CSSResultArray,
  TemplateResult,
  html,
  css,
  property
} from "lit-element";
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { HomeAssistant } from "custom-card-helpers";
import { HacsStyle } from "../style/hacs-style"

import { RepositoryWebSocketAction } from "../misc/RepositoryWebSocketAction"

import { Configuration, Repository, Route, Status } from "../types"
import { navigate } from "../misc/navigate"
import { LovelaceConfig } from "../misc/LovelaceTypes"

import "../misc/Authors"
import "../misc/HacsRepositoryMenu"
import "../buttons/HacsButtonOpenPlugin"
import "../buttons/HacsButtonOpenRepository"
import "../buttons/HacsButtonUninstall"
import "../buttons/HacsButtonMainAction"
import "../buttons/HacsButtonChangelog"
import "../misc/RepositoryNote"
import "../misc/RepositoryBannerNote"
import "./corePanel"


@customElement("hacs-panel-repository")
export class HacsPanelRepository extends LitElement {
  @property() public hass!: HomeAssistant;
  @property() public repositories!: Repository[];
  @property() public configuration!: Configuration;
  @property() public repository!: string;
  @property() public panel: string;
  @property() public route!: Route;
  @property() public status!: Status;
  @property() public repository_view = false;
  @property() private repo: Repository;
  @property() public lovelaceconfig: LovelaceConfig;

  protected firstUpdated() {

    if (this.repo === undefined || !this.repo.updated_info) {
      RepositoryWebSocketAction(this.hass, this.repository, "set_state", "other");
      RepositoryWebSocketAction(this.hass, this.repository, "update");
    }
  }

  render(): TemplateResult | void {
    if (this.repository === undefined) {
      return html`
      <hacs-panel
        .hass=${this.hass}
        .configuration=${this.configuration}
        .repositories=${this.repositories}
        .panel=${this.panel}
        .route=${this.route}
        .status=${this.status}
        .repository_view=${this.repository_view}
        .repository=${this.repository}
        .lovelaceconfig=${this.lovelaceconfig}
      >
      </hacs-panel>
      `
    }

    var _repository = this.repository;
    var _repositories = this.repositories.filter(function (repo) {
      return repo.id === _repository
    });
    this.repo = _repositories[0]

    if (this.repo === undefined) return html`<div class="loader"><paper-spinner active></paper-spinner></div>`

    if (this.repo.installed) {
      var back = this.hass.localize(`component.hacs.common.installed`);
    } else {
      if (this.repo.category === "appdaemon") {
        var FE_cat = "appdaemon_apps";
      } else {
        FE_cat = `${this.repo.category}s`
      }
      var back = this.hass.localize(`component.hacs.common.${FE_cat} `);
    }

    return html`

    <div class="getBack">
      <mwc-button @click=${this.GoBackToStore} title="${back}">
      <ha-icon  icon="mdi:arrow-left"></ha-icon>
        ${this.hass.localize(`component.hacs.repository.back_to`)}
        ${back}
      </mwc-button>
      ${(this.repo.state == "other" ? html`<div class="loader"><paper-spinner active></paper-spinner></div>` : "")}
    </div>

    <hacs-repository-banner-note
      .hass=${this.hass}
      .status=${this.status}
      .repository=${this.repo}
      .lovelaceconfig=${this.lovelaceconfig}
      .configuration=${this.configuration}>
    </hacs-repository-banner-note>

    <ha-card header="${this.repo.name}">
      <hacs-repository-menu .hass=${this.hass} .repository=${this.repo}></hacs-repository-menu>


      <div class="card-content">

        <div class="description addition">
          ${this.repo.description}
        </div>

        <div class="information MobileGrid">
          ${(this.repo.installed ?
        html`
          <div class="version installed">
            <b>${this.hass.localize(`component.hacs.repository.installed`)}: </b> ${this.repo.installed_version}
          </div>
          ` :
        "")}

        ${(String(this.repo.releases.length) === "0" ? html`
              <div class="version-available">
                  <b>${this.hass.localize(`component.hacs.repository.available`)}: </b> ${this.repo.available_version}
              </div>
          ` : html`
              <div class="version-available">
                  <paper-dropdown-menu @value-changed="${this.SetVersion}"
                    label="${this.hass.localize(`component.hacs.repository.available`)}:
                     (${this.hass.localize(`component.hacs.repository.newest`)}: ${this.repo.releases[0]})">
                      <paper-listbox slot="dropdown-content" selected="-1">
                          ${this.repo.releases.map(release =>
          html`<paper-item>${release}</paper-item>`
        )}
                          ${(this.repo.full_name !== "hacs/integration" ? html`
                          <paper-item>${this.repo.default_branch}</paper-item>
                          ` : "")}
                      </paper-listbox>
                  </paper-dropdown-menu>
              </div>`
      )}
        </div>
        <hacs-authors .hass=${this.hass} .authors=${this.repo.authors}></hacs-authors>
      </div>


      <div class="card-actions MobileGrid">
        <hacs-button-main-action .hass=${this.hass} .repository=${this.repo} .status=${this.status}></hacs-button-main-action>
        <hacs-button-changelog .hass=${this.hass} .repository=${this.repo}></hacs-button-changelog>
        <hacs-button-open-repository .hass=${this.hass} .repository=${this.repo}></hacs-button-open-repository>
        ${(this.repo.category === "plugin" ? html`
          <hacs-button-open-plugin .hass=${this.hass} .repository=${this.repo}></hacs-button-open-plugin>
        ` : "")}
        <hacs-button-uninstall class="right" .hass=${this.hass} .repository=${this.repo} .status=${this.status}></hacs-button-uninstall>
      </div>

    </ha-card>

    <ha-card class="additional">
      <div class="card-content">
        <div class="more_info">
          ${unsafeHTML(this.repo.additional_info)}
        </div>
      <hacs-repository-note
        .hass=${this.hass}
        .configuration=${this.configuration}
        .repository=${this.repo}
      ></hacs-repository-note>
      </div>
    </ha-card>
        `;
  }

  SetVersion(e: any) {
    if (e.detail.value.length > 0) {
      RepositoryWebSocketAction(this.hass, this.repo.id, "set_state", "other");
      RepositoryWebSocketAction(this.hass, this.repo.id, "set_version", e.detail.value);
    }
  }

  GoBackToStore() {

    this.repository = undefined;
    if (this.repo.installed) {
      this.panel = "installed"
    } else {
      this.panel = this.repo.category
    }
    navigate(this, `/ ${this._rootPath} /${this.panel}`)
    this.requestUpdate();
  }

  private get _rootPath() {
    if (window.location.pathname.split("/")[1] === "hacs_dev") return "hacs_dev";
    return "hacs"
  }


  static get styles(): CSSResultArray {
    return [HacsStyle, css`
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
     paper-dropdown-menu {
        width: 80%;
     }
      .description {
        font-style: italic;
        padding-bottom: 16px;
      }
      .version {
        padding-bottom: 8px;
      }
      .options {
        float: right;
        width: 40%;
      }
      .information {
        width: 60%;
      }
      .additional {
        margin-bottom: 108px;
      }
      .getBack {
        margin-top: 8px;
        margin-bottom: 4px;
        margin-left: 5%;
      }
      .right {
        float: right;
      }
      .loading {
        text-align: center;
        width: 100%;
      }
      ha-card {
        width: 90%;
        margin-left: 5%;
      }
      .link-icon {
        color: var(--dark-primary-color);
        margin-right: 8px;
      }

    `]
  }
}