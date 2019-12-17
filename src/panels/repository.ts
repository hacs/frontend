import {
  LitElement,
  customElement,
  CSSResultArray,
  TemplateResult,
  html,
  css,
  property
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";
import { HacsStyle } from "../style/hacs-style";

import { RepositoryWebSocketAction } from "../misc/RepositoryWebSocketAction";

import {
  Configuration,
  Repository,
  Route,
  Status,
  ValueChangedEvent,
  LovelaceConfig
} from "../types";
import { localize } from "../localize/localize";
import emoji from "node-emoji";
import { markdown } from "../markdown/markdown";
import { GFM, HLJS } from "../markdown/styles";

import "../misc/RepositoryAuthors";
import "../misc/HacsRepositoryMenu";
import "../components/buttons/HacsButtonOpenPlugin";
import "../components/buttons/HacsButtonOpenRepository";
import "../components/buttons/HacsButtonUninstall";
import "../components/buttons/HacsButtonMainAction";
import "../components/buttons/HacsButtonChangelog";
import "../components/HacsBody";
import "../misc/RepositoryNote";
import "../misc/RepositoryBannerNote";

@customElement("hacs-panel-repository")
export class HacsPanelRepository extends LitElement {
  @property({ type: Array }) public repositories!: Repository[];
  @property({ type: Boolean }) public repository_view = false;
  @property({ type: Object }) private repo: Repository;
  @property({ type: Object }) public configuration!: Configuration;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public lovelaceconfig: LovelaceConfig;
  @property({ type: Object }) public route!: Route;
  @property({ type: Object }) public status!: Status;
  @property() public panel: string;
  @property() public repository!: string;

  protected firstUpdated() {
    if (this.repo === undefined || !this.repo.updated_info) {
      RepositoryWebSocketAction(
        this.hass,
        this.repository,
        "set_state",
        "other"
      );
      RepositoryWebSocketAction(this.hass, this.repository, "update");
    }
  }

  render(): TemplateResult | void {
    var _repository = this.repository;
    var _repositories = this.repositories.filter(function(repo) {
      return repo.id === _repository;
    });
    this.repo = _repositories[0];

    if (this.repo === undefined)
      return html`
        <div class="loader"><paper-spinner active></paper-spinner></div>
      `;

    if (this.repo.installed) {
      var back = localize(`common.installed`);
    } else {
      if (this.repo.category === "appdaemon") {
        var FE_cat = "appdaemon_apps";
      } else {
        FE_cat = `${this.repo.category}s`;
      }
      var back = localize(`common.${FE_cat}`);
    }

    return html`
      <hacs-body>
        <div class="getBack">
          <mwc-button @click=${this.GoBackToStore} title="${back}">
            <ha-icon icon="mdi:arrow-left"></ha-icon>
            ${localize(`repository.back_to`)} ${back}
          </mwc-button>
          ${this.repo.state === "other"
            ? html`
                <div class="loader"><paper-spinner active></paper-spinner></div>
              `
            : ""}
        </div>

        <hacs-repository-banner-note
          .hass=${this.hass}
          .status=${this.status}
          .repository=${this.repo}
          .lovelaceconfig=${this.lovelaceconfig}
          .configuration=${this.configuration}
        >
        </hacs-repository-banner-note>

        <ha-card>
          <div class="repotitle">
            ${emoji.emojify(this.repo.name || "")}
          </div>
          <hacs-repository-menu
            .hass=${this.hass}
            .repository=${this.repo}
          ></hacs-repository-menu>

          <div class="card-content">
            <div class="description">
              ${emoji.emojify(this.repo.description || "")}
            </div>

            <div class="information">
              <hacs-authors
                .hass=${this.hass}
                .authors=${this.repo.authors}
              ></hacs-authors>
              ${this.repo.installed
                ? html`
                    <div class="version-installed">
                      <b>${localize(`repository.installed`)}: </b> ${this.repo
                        .installed_version}
                    </div>
                  `
                : ""}
              ${String(this.repo.releases.length) === "0"
                ? html`
                    <div class="version-available">
                      <b>${localize(`repository.available`)}: </b> ${this.repo
                        .available_version}
                    </div>
                  `
                : html`
                    <div class="version-available">
                      <paper-dropdown-menu
                        @value-changed="${this.SetVersion}"
                        label="${localize(`repository.available`)}:
                     (${localize(`repository.newest`)}: ${this.repo
                          .releases[0]})"
                      >
                        <paper-listbox
                          slot="dropdown-content"
                          selected="${this.repo.selected_tag}"
                          attr-for-selected="value"
                        >
                          ${this.repo.releases.map(
                            release =>
                              html`
                                <paper-item value="${release}"
                                  >${release}</paper-item
                                >
                              `
                          )}
                          ${this.repo.full_name !== "hacs/integration"
                            ? html`
                                <paper-item value="${this.repo.default_branch}"
                                  >${this.repo.default_branch}</paper-item
                                >
                              `
                            : ""}
                        </paper-listbox>
                      </paper-dropdown-menu>
                    </div>
                  `}
            </div>
          </div>

          <div class="card-actions MobileGrid">
            <hacs-button-main-action
              .hass=${this.hass}
              .repository=${this.repo}
              .status=${this.status}
            ></hacs-button-main-action>
            <hacs-button-changelog
              .hass=${this.hass}
              .repository=${this.repo}
            ></hacs-button-changelog>
            <hacs-button-open-repository
              .hass=${this.hass}
              .repository=${this.repo}
            ></hacs-button-open-repository>
            ${this.repo.category === "plugin"
              ? html`
                  <hacs-button-open-plugin
                    .hass=${this.hass}
                    .repository=${this.repo}
                  ></hacs-button-open-plugin>
                `
              : ""}
            <hacs-button-uninstall
              class="right"
              .hass=${this.hass}
              .repository=${this.repo}
              .status=${this.status}
            ></hacs-button-uninstall>
          </div>
        </ha-card>
        ${this.repo.updated_info
          ? html`
              <ha-card class="additional">
                <div class="card-content">
                  <div class="more_info markdown-body">
                    <style>
                      ${GFM} ${HLJS}
                    </style>
                    ${markdown.html(this.repo.additional_info || "", this.repo)}
                  </div>
                  <hacs-repository-note
                    .hass=${this.hass}
                    .configuration=${this.configuration}
                    .repository=${this.repo}
                  ></hacs-repository-note>
                </div>
              </ha-card>
            `
          : ""}
      </hacs-body>
    `;
  }

  SetVersion(e: ValueChangedEvent) {
    if (e.detail.value.length > 0) {
      RepositoryWebSocketAction(this.hass, this.repo.id, "set_state", "other");
      RepositoryWebSocketAction(
        this.hass,
        this.repo.id,
        "set_version",
        e.detail.value
      );
    }
  }

  GoBackToStore() {
    this.repository = undefined;
    if (this.repo.installed) {
      this.panel = "installed";
    } else {
      this.panel = this.repo.category;
    }
    this.route.path = `/${this.panel}`;
    this.dispatchEvent(
      new CustomEvent("hacs-location-change", {
        detail: { value: this.route },
        bubbles: true,
        composed: true
      })
    );
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`
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
          width: 50%;
        }
        @media screen and (max-width: 600px) and (min-width: 0) {
          paper-dropdown-menu {
            width: 100%;
          }
        }
        paper-item {
          display: flex;
          background-color: var(
            --paper-listbox-background-color,
            var(--primary-background-color)
          );
        }
        .description {
          width: 100%;
          margin-bottom: 8px;
          color: var(--secondary-text-color);
          text-align: left !important;
        }
        .version {
          padding-bottom: 8px;
        }
        .options {
          float: right;
          width: 40%;
        }
        .information {
          width: 100%;
        }
        .additional {
          margin-bottom: 108px;
        }
        .getBack {
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
        .repotitle {
          padding: 24px 24px 24px 18px;
          width: calc(100% - (24px + 4px + 24px + 56px));
          font-size: 1.5em;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      `
    ];
  }
}
