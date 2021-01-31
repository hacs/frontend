import { mdiPlus } from "@mdi/js";
import { css, customElement, html, LitElement, property, TemplateResult } from "lit-element";
import memoizeOne from "memoize-one";
import "../../homeassistant-frontend/src/common/search/search-input";
import "../../homeassistant-frontend/src/components/ha-card";
import "../../homeassistant-frontend/src/components/ha-fab";
import "../../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import "../components/hacs-fab";
import "../components/hacs-filter";
import "../components/hacs-repository-card";
import "../components/hacs-tabbed-menu";
import { Repository } from "../data/common";
import { Hacs } from "../data/hacs";
import { fabStyles, hassTabsSubpage, scrollBarStyle, searchStyles } from "../styles/element-styles";
import { HacsStyles } from "../styles/hacs-common-style";
import { filterRepositoriesByInput } from "../tools/filter-repositories-by-input";
import { activePanel } from "./hacs-sections";

@customElement("hacs-store-panel")
export class HacsStorePanel extends LitElement {
  @property({ attribute: false }) public filters: any = {};
  @property({ attribute: false }) public hacs?: Hacs;
  @property() private _searchInput: string = "";
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public isWide!: boolean;
  @property({ attribute: false }) public repositories!: Repository[];
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
      this.repositories,
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
    this.filters[this.section].find(
      (filter) => filter.id === current.id
    ).checked = !current.checked;
    this.requestUpdate();
  }

  protected render(): TemplateResult {
    if (!this.hacs) {
      return html``;
    }

    const newRepositories = this._repositoriesInActiveSection(this.repositories, this.section)[1];

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
      <hacs-tabbed-menu
        slot="toolbar-icon"
        .hass=${this.hass}
        .hacs=${this.hacs}
        .route=${this.route}
        .narrow=${this.narrow}
        .configuration=${this.hacs.configuration}
        .lovelace=${this.hacs.resources}
        .status=${this.hacs.status}
        .repositories=${this.repositories}
      >
      </hacs-tabbed-menu>
      ${this.narrow
        ? html`
            <div slot="header">
              <slot name="header">
                <search-input
                  class="header"
                  no-label-float
                  .label=${this.hacs.localize("search.installed")}
                  .filter=${this._searchInput || ""}
                  @value-changed=${this._inputValueChanged}
                ></search-input>
              </slot>
            </div>
          `
        : html`<div class="search">
            <search-input
              no-label-float
              .label=${newRepositories.length === 0
                ? this.hacs.localize("search.installed")
                : this.hacs.localize("search.installed_new")}
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
        ${newRepositories?.length > 10
          ? html`<div class="new-repositories">
              ${this.hacs.localize("store.new_repositories_note")}
            </div>`
          : ""}
        <div class="container ${this.narrow ? "narrow" : ""}">
          ${this.repositories === undefined
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
        .label=${this.hacs.localize("store.add")}
        extended
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
          .status=${this.hacs.status}
          .removed=${this.hacs.removed}
          .addedToLovelace=${this.hacs.addedToLovelace(this.hacs, repo)}
        ></hacs-repository-card>`
    );
  }

  private _renderNoResultsFound(): TemplateResult {
    return html`<ha-card class="no-repositories">
      <div class="header">${this.hacs.localize("store.no_repositories")} 😕</div>
      <p>
        ${this.hacs
          .localize("store.no_repositories_found_desc1")
          .replace("{searchInput}", this._searchInput)}
        <br />
        ${this.hacs.localize("store.no_repositories_found_desc2")}
      </p>
    </ha-card>`;
  }

  private _renderEmpty(): TemplateResult {
    return html`<ha-card class="no-repositories">
      <div class="header">${this.hacs.localize("store.no_repositories")} 😕</div>
      <p>
        ${this.hacs.localize("store.no_repositories_desc1")}<br />${this.hacs.localize(
          "store.no_repositories_desc2"
        )}
      </p>
    </ha-card>`;
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
          repositories: this.repositories,
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
      hassTabsSubpage,
      fabStyles,
      searchStyles,
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
        .no-repositories {
          width: 100%;
          text-align: center;
          margin-top: 12px;
        }
        .new-repositories {
          margin: 4px 16px 0 16px;
          color: var(--hcv-text-color-primary);
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
        .narrow {
          width: 100%;
          display: block;
          padding: 0px;
          margin: 0;
        }

        .container .narrow {
          margin-bottom: 128px;
        }

        .bottom-bar {
          position: fixed !important;
        }
      `,
    ];
  }
}
