import { LitElement, customElement, property, html, css, TemplateResult } from "lit-element";
import memoizeOne from "memoize-one";
import "@material/mwc-fab";
import { mdiPlus } from "@mdi/js";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import "../../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import "../../homeassistant-frontend/src/common/search/search-input";
import { Repository } from "../data/common";

import "../components/hacs-repository-card";
import "../components/hacs-filter";
import "../components/hacs-fab";
import "../components/hacs-tabbed-menu";

import { localize } from "../localize/localize";
import { HacsStyles } from "../styles/hacs-common-style";
import { hassTabsSubpage, fabStyles, searchStyles, scrollBarStyle } from "../styles/element-styles";
import { activePanel } from "./hacs-sections";
import { filterRepositoriesByInput } from "../tools/filter-repositories-by-input";
import { Hacs } from "../data/hacs";

@customElement("hacs-store-panel")
export class HacsStorePanel extends LitElement {
  @property({ attribute: false }) public hacs?: Hacs;
  @property() private _searchInput: string = "";
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public isWide!: boolean;
  @property({ attribute: false }) public repositories!: Repository[];
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public filters: any = {};
  @property({ attribute: false }) public sections!: any;
  @property() public section!: string;

  private _repositoriesInActiveSection = memoizeOne(
    (repositories: Repository[], sections: any, section: string) => {
      const installedRepositories: Repository[] = repositories?.filter(
        (repo) =>
          sections.find((panel) => panel.id === section).categories?.includes(repo.category) &&
          repo.installed
      );
      const newRepositories: Repository[] = repositories?.filter(
        (repo) =>
          sections.find((panel) => panel.id === section).categories?.includes(repo.category) &&
          repo.new &&
          !repo.installed
      );
      return [installedRepositories || [], newRepositories || []];
    }
  );

  private get allRepositories(): Repository[] {
    const [installedRepositories, newRepositories] = this._repositoriesInActiveSection(
      this.repositories,
      this.sections,
      this.section
    );

    return newRepositories.concat(installedRepositories);
  }

  private _filterRepositories = memoizeOne(filterRepositoriesByInput);

  private get visibleRepositories(): Repository[] {
    const repositories = this.allRepositories.filter(
      (repo) =>
        this.filters[this.section].find((filter) => filter.id === repo.category)?.checked || true
    );
    return this._filterRepositories(repositories, this._searchInput);
  }

  protected async firstUpdated() {
    this.addEventListener("filter-change", (e) => this._updateFilters(e));
  }

  private _updateFilters(e) {
    const current = this.filters[this.section].find((filter) => filter.id === e.detail.id);
    this.filters[this.section].find(
      (filter) => filter.id === current.id
    ).checked = !current.checked;
    this.requestUpdate();
  }

  protected render(): TemplateResult {
    const newRepositories = this._repositoriesInActiveSection(
      this.repositories,
      this.sections,
      this.section
    )[1];

    if (!this.filters[this.section]) {
      const categories = activePanel(this.route)?.categories;
      this.filters[this.section] = [];
      categories
        ?.filter((c) => this.hacs.configuration?.categories?.includes(c))
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
      .tabs=${this.sections}
      hasFab
    >
      <hacs-tabbed-menu
        slot="toolbar-icon"
        .hass=${this.hass}
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
                  no-underline
                  .filter=${this._searchInput || ""}
                  @value-changed=${this._inputValueChanged}
                ></search-input>
              </slot>
            </div>
          `
        : ""}
      <div class="content ${this.narrow ? "narrow-content" : ""}">
        ${!this.narrow
          ? html`<search-input
              no-label-float
              no-underline
              .filter=${this._searchInput || ""}
              @value-changed=${this._inputValueChanged}
            ></search-input>`
          : ""}
        ${newRepositories?.length > 10
          ? html`<div class="new-repositories">
              ${localize("store.new_repositories_note")}
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
      <mwc-fab ?is-wide=${this.isWide} ?narrow=${this.narrow} @click=${this._addRepository}>
        <ha-svg-icon slot="icon" path=${mdiPlus}></ha-svg-icon>
      </mwc-fab>
    </hass-tabs-subpage>`;
  }

  private _renderRepositories(): TemplateResult[] {
    return this.visibleRepositories.map(
      (repo) =>
        html`<hacs-repository-card
          .hass=${this.hass}
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
      <div class="header">${localize("store.no_repositories")} 😕</div>
      <p>
        ${localize("store.no_repositories_found_desc1").replace("{searchInput}", this._searchInput)}
        <br />
        ${localize("store.no_repositories_found_desc2")}
      </p>
    </ha-card>`;
  }

  private _renderEmpty(): TemplateResult {
    return html`<ha-card class="no-repositories">
      <div class="header">${localize("store.no_repositories")} 😕</div>
      <p>
        ${localize("store.no_repositories_desc1")}<br />${localize("store.no_repositories_desc2")}
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
          height: calc(100vh - 65px);
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
