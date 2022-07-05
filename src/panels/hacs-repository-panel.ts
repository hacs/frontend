import { css, html, LitElement, TemplateResult, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators";
import "../../homeassistant-frontend/src/components/ha-alert";
import "../../homeassistant-frontend/src/components/ha-card";
import "../../homeassistant-frontend/src/components/ha-fab";
import "../../homeassistant-frontend/src/components/ha-icon-overflow-menu";
import "../../homeassistant-frontend/src/components/search-input";
import "../../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import "../components/hacs-filter";
import "../components/hacs-repository-card";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "../../homeassistant-frontend/src/layouts/hass-subpage";
import "../../homeassistant-frontend/src/layouts/hass-loading-screen";
import "../../homeassistant-frontend/src/layouts/hass-error-screen";
import { Hacs } from "../data/hacs";
import { HacsStyles } from "../styles/hacs-common-style";
import {
  mdiAccount,
  mdiAlert,
  mdiAlertCircleOutline,
  mdiArrowDownBold,
  mdiArrowDownCircle,
  mdiClose,
  mdiCube,
  mdiExclamationThick,
  mdiGithub,
  mdiLanguageJavascript,
  mdiReload,
  mdiStar,
} from "@mdi/js";
import { Repository } from "../data/common";
import { fetchRepositoryInformation } from "../data/websocket";
import { mainWindow } from "../../homeassistant-frontend/src/common/dom/get_main_window";
import { markdown } from "../tools/markdown/markdown";
import memoizeOne from "memoize-one";

@customElement("hacs-repository-panel")
export class HacsRepositoryPanel extends LitElement {
  @property({ attribute: false }) public hacs!: Hacs;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public narrow!: boolean;

  @property({ attribute: false }) public isWide!: boolean;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public _repository?: Repository;

  @state() private _error?: string;

  protected firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    const dividerPos = this.route.path.indexOf("/", 1);
    const repositoryId = this.route.path.substr(dividerPos + 1);
    if (!repositoryId) {
      this._error = "Missing repositoryId from route";
      return;
    }
    fetchRepositoryInformation(this.hass, repositoryId)
      .then((data) => {
        this._repository = data;
        if (!this._repository) {
          this._error = "No repository for " + repositoryId;
        }
      })
      .catch((err) => {
        this._error = err;
      });
  }

  private _getAuthors = memoizeOne((repository: Repository) => {
    const authors: string[] = [];
    if (!repository.authors) return authors;
    repository.authors.forEach((author) => authors.push(author.replace("@", "")));
    if (authors.length === 0) {
      const author = repository.full_name.split("/")[0];
      if (
        ["custom-cards", "custom-components", "home-assistant-community-themes"].includes(author)
      ) {
        return authors;
      }
      authors.push(author);
    }
    return authors;
  });

  protected render(): TemplateResult {
    if (this._error) {
      return html`<hass-error-screen .error=${this._error}></hass-error-screen>`;
    }

    if (!this._repository) {
      return html`<hass-loading-screen></hass-loading-screen>`;
    }

    const authors = this._getAuthors(this._repository);

    return html`
      <hass-subpage
        .hass=${this.hass}
        .narrow=${this.narrow}
        .route=${this.route}
        .header=${this._repository.name}
      >
        <ha-icon-overflow-menu
          slot="toolbar-icon"
          narrow
          .hass=${this.hass}
          .items=${[
            {
              path: mdiGithub,
              label: this.hacs.localize("common.repository"),
              action: () =>
                mainWindow.open(
                  `https://github.com/${this._repository!.full_name}`,
                  "_blank",
                  "noreferrer=true"
                ),
            },
            {
              path: mdiArrowDownCircle,
              label: this.hacs.localize("repository_card.update_information"),
              action: () => this._updateReopsitoryInfo(),
            },
            {
              path: mdiReload,
              label: this.hacs.localize("repository_card.redownload"),
              action: () => this._installRepository(),
            },
            {
              category: "plugin",
              path: mdiLanguageJavascript,
              label: this.hacs.localize("repository_card.open_source"),
              action: () =>
                mainWindow.open(
                  `/hacsfiles/${path.pop()}/${this._repository!.file_name}`,
                  "_blank",
                  "noreferrer=true"
                ),
            },
            {
              path: mdiAlertCircleOutline,
              label: this.hacs.localize("repository_card.open_issue"),
              action: () =>
                mainWindow.open(
                  `https://github.com/${this._repository.full_name}/issues`,
                  "_blank",
                  "noreferrer=true"
                ),
            },
            {
              hideForId: "172733314",
              path: mdiAlert,
              label: this.hacs.localize("repository_card.report"),
              action: () =>
                mainWindow.open(
                  `https://github.com/hacs/integration/issues/new?assignees=ludeeus&labels=flag&template=removal.yml&repo=${
                    this._repository!.full_name
                  }&title=Request for removal of ${this._repository!.full_name}`,
                  "_blank",
                  "noreferrer=true"
                ),
            },
            {
              hideForId: "172733314",
              path: mdiClose,
              label: this.hacs.localize("common.remove"),
              action: () => this._uninstallRepositoryDialog(),
            },
          ].filter(
            (entry) =>
              (!entry.category || this._repository!.category === entry.category) &&
              (!entry.hideForId || String(this._repository!.id) !== entry.hideForId)
          )}
        >
        </ha-icon-overflow-menu>
        <div class="content">
          <div class="chips">
            ${this._repository.installed
              ? html`
                  <ha-chip title="${this.hacs.localize("dialog_info.version_installed")}" hasIcon>
                    <ha-svg-icon slot="icon" .path=${mdiCube}></ha-svg-icon>
                    ${this._repository.installed_version}
                  </ha-chip>
                `
              : ""}
            ${authors
              ? authors.map(
                  (author) => html`<hacs-link .url="https://github.com/${author}">
                    <ha-chip title="${this.hacs.localize("dialog_info.author")}" hasIcon>
                      <ha-svg-icon slot="icon" .path=${mdiAccount}></ha-svg-icon>
                      @${author}
                    </ha-chip>
                  </hacs-link>`
                )
              : ""}
            ${this._repository.downloads
              ? html` <ha-chip hasIcon title="${this.hacs.localize("dialog_info.downloads")}">
                  <ha-svg-icon slot="icon" .path=${mdiArrowDownBold}></ha-svg-icon>
                  ${this._repository.downloads}
                </ha-chip>`
              : ""}
            <ha-chip title="${this.hacs.localize("dialog_info.stars")}" hasIcon>
              <ha-svg-icon slot="icon" .path=${mdiStar}></ha-svg-icon>
              ${this._repository.stars}
            </ha-chip>
            <hacs-link .url="https://github.com/${this._repository.full_name}/issues">
              <ha-chip title="${this.hacs.localize("dialog_info.open_issues")}" hasIcon>
                <ha-svg-icon slot="icon" .path=${mdiExclamationThick}></ha-svg-icon>
                ${this._repository.issues}
              </ha-chip>
            </hacs-link>
          </div>
          ${markdown.html(
            this._repository.additional_info || this.hacs.localize("dialog_info.no_info"),
            this._repository
          )}
        </div>
      </hass-subpage>
    `;
  }

  static get styles() {
    return [
      HacsStyles,
      css`
        hass-subpage {
          position: absolute;
          width: 100vw;
        }

        .content {
          margin: 12px;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          padding-bottom: 8px;
          gap: 4px;
        }

        @media all and (max-width: 500px) {
          .content {
            margin: 8px 4px;
          }
        }
      `,
    ];
  }
}
