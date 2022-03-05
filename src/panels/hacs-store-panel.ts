import "../../homeassistant-frontend/src/components/search-input";
import {
  mdiAlertCircleOutline,
  mdiFileDocument,
  mdiGit,
  mdiGithub,
  mdiInformation,
  mdiPlus,
} from "@mdi/js";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import memoizeOne from "memoize-one";
import { computeRTL } from "../../homeassistant-frontend/src/common/util/compute_rtl";
import "../../homeassistant-frontend/src/components/ha-alert";
import "../../homeassistant-frontend/src/components/ha-card";
import "../../homeassistant-frontend/src/components/ha-fab";
import "../../homeassistant-frontend/src/components/ha-icon-overflow-menu";
import "../../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { showDialogAbout } from "../components/dialogs/hacs-about-dialog";
import "../components/hacs-filter";
import "../components/hacs-repository-card";
import { Repository } from "../data/common";
import { Hacs } from "../data/hacs";
import { settingsClearAllNewRepositories } from "../data/websocket";
import { scrollBarStyle } from "../styles/element-styles";
import { HacsStyles } from "../styles/hacs-common-style";
import { filterRepositoriesByInput } from "../tools/filter-repositories-by-input";
import { activePanel } from "./hacs-sections";
import { mainWindow } from "../../homeassistant-frontend/src/common/dom/get_main_window";

@customElement("hacs-store-panel")
export class HacsStorePanel extends LitElement {
  @property({ attribute: false }) public filters: any = {};

  @property({ attribute: false }) public hacs!: Hacs;

  @property() private _searchInput = "";

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public narrow!: boolean;

  @property({ attribute: false }) public isWide!: boolean;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public sections!: any;

  @property() public section!: string;

  private _repositoriesInActiveSection = memoizeOne(
    (repositories: Repository[], section: string) => {
      const installedRepositories: Repository[] = repositories?.filter(
        (repo) =>
          this.hacs.sections
            ?.find((panel) => panel.id === section)
            ?.categories?.includes(repo.category) && repo.installed
      );
      const newRepositories: Repository[] = repositories?.filter(
        (repo) =>
          this.hacs.sections
            ?.find((panel) => panel.id === section)
            ?.categories?.includes(repo.category) &&
          repo.new &&
          !repo.installed
      );
      return [installedRepositories || [], newRepositories || []];
    }
  );

  private get allRepositories(): Repository[] {
    const [installedRepositories, newRepositories] = this._repositoriesInActiveSection(
      this.hacs.repositories,
      this.section
    );

    return newRepositories.concat(installedRepositories);
  }

  private _filterRepositories = memoizeOne(filterRepositoriesByInput);

  private get visibleRepositories(): Repository[] {
    const repositories = this.allRepositories.filter(
      (repo) => this.filters[this.section]?.find((filter) => filter.id === repo.category)?.checked
    );
    return this._filterRepositories(repositories, this._searchInput);
  }

  protected async firstUpdated() {
    this.addEventListener("filter-change", (e) => this._updateFilters(e));
  }

  private _updateFilters(e) {
    const current = this.filters[this.section]?.find((filter) => filter.id === e.detail.id);
    this.filters[this.section].find((filter) => filter.id === current.id).checked =
      !current.checked;
    this.requestUpdate();
  }

  protected render(): TemplateResult {
    if (!this.hacs) {
      return html``;
    }

    const newRepositories = this._repositoriesInActiveSection(
      this.hacs.repositories,
      this.section
    )[1];

    if (!this.filters[this.section] && this.hacs.configuration.categories) {
      const categories = activePanel(this.hacs.language, this.route)?.categories;
      this.filters[this.section] = [];
      categories
        ?.filter((c) => this.hacs.configuration?.categories.includes(c))
        .forEach((category) => {
          this.filters[this.section].push({
            id: category,
            value: category,
            checked: true,
          });
        });
    }

    return html`<hass-tabs-subpage
      back-path="/hacs/entry"
      .hass=${this.hass}
      .narrow=${this.narrow}
      .route=${this.route}
      .tabs=${this.hacs.sections}
      hasFab
    >
      <ha-icon-overflow-menu
        slot="toolbar-icon"
        narrow
        .hass=${this.hass}
        .items=${[
          {
            path: mdiFileDocument,
            label: this.hacs.localize("menu.documentation"),
            action: () => mainWindow.open("https://hacs.xyz/", "_blank", "noreferrer=true"),
          },
          {
            path: mdiGithub,
            label: "GitHub",
            action: () => mainWindow.open("https://github.com/hacs", "_blank", "noreferrer=true"),
          },
          {
            path: mdiAlertCircleOutline,
            label: this.hacs.localize("menu.open_issue"),
            action: () =>
              mainWindow.open("https://hacs.xyz/docs/issues", "_blank", "noreferrer=true"),
          },
          {
            path: mdiGit,
            label: this.hacs.localize("menu.custom_repositories"),
            disabled: this.hacs.status.disabled || this.hacs.status.background_task,
            action: () =>
              this.dispatchEvent(
                new CustomEvent("hacs-dialog", {
                  detail: {
                    type: "custom-repositories",
                    repositories: this.hacs.repositories,
                  },
                  bubbles: true,
                  composed: true,
                })
              ),
          },

          {
            path: mdiInformation,
            label: this.hacs.localize("menu.about"),
            action: () => showDialogAbout(this, this.hacs),
          },
        ]}
      >
      </ha-icon-overflow-menu>
      ${this.narrow
        ? html`
            <search-input
              .hass=${this.hass}
              class="header"
              slot="header"
              .label=${this.hacs.localize("search.downloaded")}
              .filter=${this._searchInput || ""}
              @value-changed=${this._inputValueChanged}
            ></search-input>
          `
        : html`<div class="search">
            <search-input
              .hass=${this.hass}
              .label=${newRepositories.length === 0
                ? this.hacs.localize("search.downloaded")
                : this.hacs.localize("search.downloaded_new")}
              .filter=${this._searchInput || ""}
              @value-changed=${this._inputValueChanged}
            ></search-input>
          </div>`}
      <div class="content ${this.narrow ? "narrow-content" : ""}">
        ${this.filters[this.section]?.length > 1
          ? html`<div class="filters">
              <hacs-filter
                .hacs=${this.hacs}
                .filters="${this.filters[this.section]}"
              ></hacs-filter>
            </div>`
          : ""}
        ${newRepositories?.length
          ? html`<ha-alert .rtl=${computeRTL(this.hass)}>
              ${this.hacs.localize("store.new_repositories_note")}
              <mwc-button
                class="max-content"
                slot="action"
                .label=${this.hacs.localize("menu.dismiss")}
                @click=${this._clearAllNewRepositories}
              >
              </mwc-button>
            </ha-alert> `
          : ""}
        <div class="container ${this.narrow ? "narrow" : ""}">
          ${this.hacs.repositories === undefined
            ? ""
            : this.allRepositories.length === 0
            ? this._renderEmpty()
            : this.visibleRepositories.length === 0
            ? this._renderNoResultsFound()
            : this._renderRepositories()}
        </div>
      </div>
      <ha-fab
        slot="fab"
        .label=${this.hacs.localize("store.explore")}
        .extended=${!this.narrow}
        @click=${this._addRepository}
      >
        <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
      </ha-fab>
    </hass-tabs-subpage>`;
  }

  private _renderRepositories(): TemplateResult[] {
    return this.visibleRepositories.map(
      (repo) =>
        html`<hacs-repository-card
          .hass=${this.hass}
          .hacs=${this.hacs}
          .repository=${repo}
          .narrow=${this.narrow}
          ?narrow=${this.narrow}
        ></hacs-repository-card>`
    );
  }

  private async _clearAllNewRepositories() {
    await settingsClearAllNewRepositories(
      this.hass,
      activePanel(this.hacs.language, this.route)?.categories || []
    );
  }

  private _renderNoResultsFound(): TemplateResult {
    return html`<ha-alert
      .rtl=${computeRTL(this.hass)}
      alert-type="warning"
      .title="${this.hacs!.localize("store.no_repositories")} 😕"
    >
      ${this.hacs!.localize("store.no_repositories_found_desc1", {
        searchInput: this._searchInput,
      })}
      <br />
      ${this.hacs!.localize("store.no_repositories_found_desc2")}
    </ha-alert>`;
  }

  private _renderEmpty(): TemplateResult {
    return html`<ha-alert
      .title="${this.hacs!.localize("store.no_repositories")} 😕"
      .rtl=${computeRTL(this.hass)}
    >
      ${this.hacs!.localize("store.no_repositories_desc1")}
      <br />
      ${this.hacs!.localize("store.no_repositories_desc2")}
    </ha-alert>`;
  }

  private _inputValueChanged(ev: any) {
    this._searchInput = ev.detail.value;
    window.localStorage.setItem("hacs-search", this._searchInput);
  }

  private _addRepository() {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "add-repository",
          repositories: this.hacs.repositories,
          section: this.section,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  static get styles() {
    return [
      HacsStyles,
      scrollBarStyle,
      css`
        .filter {
          border-bottom: 1px solid var(--divider-color);
        }
        .content {
          height: calc(100vh - 128px);
          overflow: auto;
        }
        .narrow-content {
          height: calc(100vh - 128px);
        }
        .container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
          justify-items: center;
          grid-gap: 8px 8px;
          padding: 8px 16px 16px;
          margin-bottom: 64px;
        }
        ha-svg-icon {
          color: var(--hcv-text-color-on-background);
        }
        hacs-repository-card {
          max-width: 500px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        hacs-repository-card[narrow] {
          width: 100%;
        }
        hacs-repository-card[narrow]:last-of-type {
          margin-bottom: 64px;
        }
        ha-alert {
          color: var(--hcv-text-color-primary);
          display: block;
          margin-top: -4px;
        }
        .narrow {
          width: 100%;
          display: block;
          padding: 0px;
          margin: 0;
        }
        search-input {
          display: block;
        }

        search-input.header {
          padding: 0;
        }

        .bottom-bar {
          position: fixed !important;
        }
        .max-content {
          width: max-content;
        }
      `,
    ];
  }
}
