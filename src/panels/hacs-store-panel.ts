import { LitElement, customElement, property, html, css, TemplateResult } from "lit-element";
import memoizeOne from "memoize-one";

import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import "../../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import {
  Status,
  Configuration,
  Repository,
  LovelaceResource,
  RemovedRepository,
} from "../data/common";

import "../components/hacs-repository-card";
import "../components/hacs-search";
import "../components/hacs-filter";
import "../components/hacs-fab";
import "../components/hacs-tabbed-menu";

import { localize } from "../localize/localize";
import { HacsStyles } from "../styles/hacs-common-style";
import { hassTabsSubpage } from "../styles/element-styles";
import { sections, activePanel } from "./hacs-sections";
import { addedToLovelace } from "../tools/added-to-lovelace";
import { filterRepositoriesByInput } from "../tools/filter-repositories-by-input";

@customElement("hacs-store-panel")
export class HacsStorePanel extends LitElement {
  @property() private _searchInput: string = "";
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public repositories!: Repository[];
  @property({ attribute: false }) public lovelace: LovelaceResource[];
  @property({ attribute: false }) public status: Status;
  @property({ attribute: false }) public removed: RemovedRepository[];
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
        ?.filter((c) => this.configuration.categories.includes(c))
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
    >
      <hacs-tabbed-menu
        slot="toolbar-icon"
        .hass=${this.hass}
        .route=${this.route}
        .narrow=${this.narrow}
        .configuration=${this.configuration}
        .lovelace=${this.lovelace}
        .status=${this.status}
        .repositories=${this.repositories}
      >
      </hacs-tabbed-menu>
      <div class="content">
        ${this.allRepositories.length === 0
          ? this._renderEmpty()
          : this.visibleRepositories.length === 0
          ? this._renderNoResultsFound()
          : this._renderRepositories()}
      </div>
    </hass-tabs-subpage>`;

    return html`<hacs-tabbed-layout
      .hass=${this.hass}
      .route=${this.route}
      .narrow=${this.narrow}
      .selected=${this.section}
      ><hacs-tabbed-menu
        slot="toolbar-icon"
        .hass=${this.hass}
        .route=${this.route}
        .narrow=${this.narrow}
        .configuration=${this.configuration}
        .lovelace=${this.lovelace}
        .status=${this.status}
        .repositories=${this.repositories}
      >
      </hacs-tabbed-menu>

      <hacs-search .input=${this._searchInput} @input=${this._inputValueChanged}></hacs-search>
      ${this.filters[this.section].length > 1
        ? html`<hacs-filter class="filter" .filters="${this.filters[this.section]}"></hacs-filter>`
        : ""}
      ${newRepositories?.length > 10
        ? html`<div class="new-repositories">
            ${localize("store.new_repositories_note")}
          </div>`
        : ""}
      <div class="content">
        ${this.allRepositories.length === 0
          ? this._renderEmpty()
          : this.visibleRepositories.length === 0
          ? this._renderNoResultsFound()
          : this._renderRepositories()}
      </div>
      <hacs-fab
        .narrow=${this.narrow}
        @click=${this._addRepository}
        icon="mdi:plus"
        title="Add repository"
      >
      </hacs-fab>
    </hacs-tabbed-layout>`;
  }

  private _renderRepositories(): TemplateResult[] {
    return this.visibleRepositories.map(
      (repo) =>
        html`<hacs-repository-card
          .hass=${this.hass}
          .repository=${repo}
          .narrow=${this.narrow}
          .status=${this.status}
          .removed=${this.removed}
          .addedToLovelace=${addedToLovelace(this.lovelace, this.configuration, repo)}
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
    this._searchInput = ev.target.input;
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
      css`
        .filter {
          border-bottom: 1px solid var(--divider-color);
        }
        .content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          grid-gap: 16px 16px;
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
        }
        paper-item {
          cursor: pointer;
        }
        ha-icon {
          color: var(--hcv-text-color-on-background);
        }
      `,
    ];
  }
}
