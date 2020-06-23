import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";
import memoizeOne from "memoize-one";
import { customElement, html, TemplateResult, css, property, PropertyValues } from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import { HacsDialogBase } from "./hacs-dialog-base";
import { Repository } from "../../data/common";

import { localize } from "../../localize/localize";
import { sections, activePanel } from "../../panels/hacs-sections";
import { filterRepositoriesByInput } from "../../tools/filter-repositories-by-input";
import "../hacs-search";
import "../hacs-chip";
import { hacsIcon } from "../hacs-icon";

@customElement("hacs-add-repository-dialog")
export class HacsAddRepositoryDialog extends HacsDialogBase {
  @property({ attribute: false }) public filters: any = [];
  @property() private _load: number = 30;
  @property() private _top: number = 0;
  @property() private _searchInput: string = "";
  @property() private _sortBy: string = "stars";
  @property() public section!: string;

  shouldUpdate(changedProperties: PropertyValues) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "hass") {
        this.sidebarDocked = window.localStorage.getItem("dockedSidebar") === '"docked"';
      }
    });
    return (
      changedProperties.has("sidebarDocked") ||
      changedProperties.has("narrow") ||
      changedProperties.has("filters") ||
      changedProperties.has("active") ||
      changedProperties.has("_searchInput") ||
      changedProperties.has("_load") ||
      changedProperties.has("_sortBy")
    );
  }

  private _repositoriesInActiveCategory = (repositories: Repository[], categories: string[]) =>
    repositories?.filter(
      (repo) =>
        !repo.installed &&
        sections?.panels
          .find((panel) => panel.id === this.section)
          .categories?.includes(repo.category) &&
        !repo.installed &&
        categories?.includes(repo.category) &&
        this.filters.find((filter) => filter.id === repo.category)?.checked
    );

  protected async firstUpdated() {
    this.addEventListener("filter-change", (e) => this._updateFilters(e));
  }

  private _updateFilters(e) {
    const current = this.filters.find((filter) => filter.id === e.detail.id);
    this.filters.find((filter) => filter.id === current.id).checked = !current.checked;
    this.requestUpdate("filters");
  }

  private _filterRepositories = memoizeOne(filterRepositoriesByInput);

  protected render(): TemplateResult | void {
    this._searchInput = window.localStorage.getItem("hacs-search") || "";
    if (!this.active) return html``;

    if (this.filters.length === 0) {
      const categories = activePanel(this.route)?.categories;
      categories
        ?.filter((c) => this.configuration.categories.includes(c))
        .forEach((category) => {
          this.filters.push({
            id: category,
            value: category,
            checked: true,
          });
        });
    }

    const repositories = this._filterRepositories(
      this._repositoriesInActiveCategory(this.repositories, this.configuration?.categories),
      this._searchInput
    );

    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
        @scroll=${this._loadMore}
        noActions
        ?hasFilter=${this.filters.length > 1}
        hasSearch
      >
        <div slot="header">
          ${localize("dialog_add_repo.title")}
        </div>
        <div slot="search" class="filter">
          <hacs-search .input=${this._searchInput} @input=${this._inputValueChanged}></hacs-search>
          <paper-dropdown-menu label="${localize("dialog_add_repo.sort_by")}">
            <paper-listbox slot="dropdown-content" selected="0">
              <paper-item @tap=${() => (this._sortBy = "stars")}
                >${localize("store.stars")}</paper-item
              >
              <paper-item @tap=${() => (this._sortBy = "name")}
                >${localize("store.name")}</paper-item
              >
              <paper-item @tap=${() => (this._sortBy = "last_updated")}
                >${localize("store.last_updated")}</paper-item
              >
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        ${this.filters.length > 1
          ? html`<div slot="filter" class="filter">
              <hacs-filter .filters="${this.filters}"></hacs-filter>
            </div>`
          : ""}
        <div class=${classMap({ content: true, narrow: this.narrow })}>
          <div class=${classMap({ list: true, narrow: this.narrow })}>
            ${repositories
              .sort((a, b) => {
                if (this._sortBy === "name") {
                  return a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase() ? -1 : 1;
                }
                return a[this._sortBy] > b[this._sortBy] ? -1 : 1;
              })
              .slice(0, this._load)
              .map(
                (repo) => html`<paper-icon-item
                  class=${classMap({ narrow: this.narrow })}
                  @click=${() => this._openInformation(repo)}
                >
                  ${repo.category === "integration"
                    ? html`
                        <img
                          src="https://brands.home-assistant.io/_/${repo.domain}/icon.png"
                          referrerpolicy="no-referrer"
                          @error=${this._onImageError}
                          @load=${this._onImageLoad}
                        />
                      `
                    : html`<ha-icon icon="mdi:github-circle" slot="item-icon"></ha-icon>`}
                  <paper-item-body two-line
                    >${repo.name}
                    <div class="category-chip">
                      <hacs-chip
                        .icon=${hacsIcon}
                        .value=${localize(`common.${repo.category}`)}
                      ></hacs-chip>
                    </div>
                    <div secondary>${repo.description}</div>
                  </paper-item-body>
                </paper-icon-item>`
              )}
            ${repositories.length === 0 ? html`<p>${localize("dialog_add_repo.no_match")}</p>` : ""}
          </div>
        </div>
      </hacs-dialog>
    `;
  }

  private _loadMore(ev) {
    const top = ev.detail.target.scrollTop;
    if (top >= this._top) {
      this._load += 1;
    } else {
      this._load -= 1;
    }
    this._top = top;
  }

  private _inputValueChanged(ev: any) {
    this._searchInput = ev.target.input;
    window.localStorage.setItem("hacs-search", this._searchInput);
  }

  private _openInformation(repo) {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog-secondary", {
        detail: {
          type: "repository-info",
          repository: repo.id,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onImageLoad(ev) {
    ev.target.style.visibility = "initial";
  }

  private _onImageError(ev) {
    if (ev.target) {
      ev.target.outerHTML = `<ha-icon
    icon="mdi:github-circle"
    slot="item-icon"
  ></ha-icon>`;
    }
  }
  static get styles() {
    return css`
      .content {
        width: 100%;
        margin-bottom: -65px;
      }
      .filter {
        margin-bottom: -65px;
        margin-top: 65px;
        display: flex;
      }
      .narrow {
        min-width: unset !important;
        width: 100% !important;
      }
      .list {
        margin-top: 16px;
        width: 1024px;
        max-width: 100%;
      }
      .category-chip {
        position: absolute;
        top: 8px;
        right: 8px;
      }
      ha-icon {
        --mdc-icon-size: 36px;
      }
      img {
        align-items: center;
        display: block;
        justify-content: center;
        margin-bottom: 16px;
        max-height: 36px;
        max-width: 36px;
        position: absolute;
      }

      paper-icon-item:focus {
        background-color: var(--divider-color);
      }

      paper-icon-item {
        cursor: pointer;
        padding: 2px 0;
      }

      paper-dropdown-menu {
        max-width: 30%;
        margin: 11px 4px -5px;
      }

      paper-item-body {
        width: 100%;
        min-height: var(--paper-item-body-two-line-min-height, 72px);
        display: var(--layout-vertical_-_display);
        flex-direction: var(--layout-vertical_-_flex-direction);
        justify-content: var(--layout-center-justified_-_justify-content);
      }
      paper-icon-item.narrow {
        border-bottom: 1px solid var(--divider-color);
        padding: 8px 0;
      }
      paper-item-body div {
        font-size: 14px;
        color: var(--secondary-text-color);
      }
      .add {
        border-top: 1px solid var(--divider-color);
        margin-top: 32px;
      }
      .add-actions {
        justify-content: space-between;
      }
      .add,
      .add-actions {
        display: flex;
        align-items: center;
        font-size: 20px;
        height: 65px;
        background-color: var(--sidebar-background-color);
        border-bottom: 1px solid var(--divider-color);
        padding: 0 16px;
        box-sizing: border-box;
      }
      .add-input {
        width: calc(100% - 80px);
        height: 40px;
        border: 0;
        padding: 0 16px;
        font-size: initial;
        color: var(--sidebar-text-color);
        font-family: var(--paper-font-body1_-_font-family);
      }
      input:focus {
        outline-offset: 0;
        outline: 0;
      }
      input {
        background-color: var(--sidebar-background-color);
      }
      paper-dropdown-menu {
        width: 75%;
      }
      hacs-search,
      hacs-filter {
        width: 100%;
      }
    `;
  }
}
