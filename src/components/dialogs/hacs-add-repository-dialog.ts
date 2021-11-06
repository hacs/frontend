import "../../../homeassistant-frontend/src/components/ha-chip";
import "@polymer/paper-item/paper-item";
import { mdiGithub } from "@mdi/js";
import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";
import "@polymer/paper-listbox/paper-listbox";
import { css, html, PropertyValues, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { classMap } from "lit/directives/class-map";
import memoizeOne from "memoize-one";
import "../../../homeassistant-frontend/src/common/search/search-input";
import "../../../homeassistant-frontend/src/components/ha-svg-icon";
import "../../../homeassistant-frontend/src/components/ha-paper-dropdown-menu";
import { Repository } from "../../data/common";
import { activePanel } from "../../panels/hacs-sections";
import { hacsIconStyle, scrollBarStyle, searchStyles } from "../../styles/element-styles";
import { filterRepositoriesByInput } from "../../tools/filter-repositories-by-input";
import "../hacs-filter";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";
import { brandsUrl } from "../../../homeassistant-frontend/src/util/brands-url";

@customElement("hacs-add-repository-dialog")
export class HacsAddRepositoryDialog extends HacsDialogBase {
  @property({ attribute: false }) public filters: any = [];

  @property({ type: Number }) private _load = 30;

  @property({ type: Number }) private _top = 0;

  @property() private _searchInput = "";

  @property() private _sortBy = "stars";

  @property() public section!: string;

  shouldUpdate(changedProperties: PropertyValues) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "hass") {
        this.sidebarDocked = window.localStorage.getItem("dockedSidebar") === '"docked"';
      }
    });
    return (
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
        this.hacs.sections
          ?.find((section) => section.id === this.section)
          .categories?.includes(repo.category) &&
        !repo.installed &&
        categories?.includes(repo.category)
    );

  protected async firstUpdated() {
    this.addEventListener("filter-change", (e) => this._updateFilters(e));
    if (this.filters?.length === 0) {
      const categories = activePanel(this.hacs.language, this.route)?.categories;
      categories
        ?.filter((c) => this.hacs.configuration?.categories.includes(c))
        .forEach((category) => {
          this.filters.push({
            id: category,
            value: category,
            checked: true,
          });
        });
      this.requestUpdate("filters");
    }
  }

  private _updateFilters(e) {
    const current = this.filters.find((filter) => filter.id === e.detail.id);
    this.filters.find((filter) => filter.id === current.id).checked = !current.checked;
    this.requestUpdate("filters");
  }

  private _filterRepositories = memoizeOne(filterRepositoriesByInput);

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    this._searchInput = window.localStorage.getItem("hacs-search") || "";

    let repositories = this._filterRepositories(
      this._repositoriesInActiveCategory(this.repositories, this.hacs.configuration?.categories),
      this._searchInput
    );

    if (this.filters.length !== 0) {
      repositories = repositories.filter(
        (repository) => this.filters.find((filter) => filter.id === repository.category)?.checked
      );
    }

    return html`
      <hacs-dialog
        .active=${this.active}
        .hass=${this.hass}
        .title=${this.hacs.localize("dialog_add_repo.title")}
        hideActions
      >
        <div class="searchandfilter">
          <search-input
            .hass=${this.hass}
            no-label-float
            .label=${this.hacs.localize("search.placeholder")}
            .filter=${this._searchInput || ""}
            @value-changed=${this._inputValueChanged}
            ?narrow=${this.narrow}
          ></search-input>
          <div class="filter">
            <ha-paper-dropdown-menu
              label="${this.hacs.localize("dialog_add_repo.sort_by")}"
              ?narrow=${this.narrow}
            >
              <paper-listbox slot="dropdown-content" selected="0">
                <paper-item @tap=${() => (this._sortBy = "stars")}>
                  ${this.hacs.localize("store.stars")}
                </paper-item>
                <paper-item @tap=${() => (this._sortBy = "name")}>
                  ${this.hacs.localize("store.name")}
                </paper-item>
                <paper-item @tap=${() => (this._sortBy = "last_updated")}>
                  ${this.hacs.localize("store.last_updated")}
                </paper-item>
              </paper-listbox>
            </ha-paper-dropdown-menu>
          </div>
        </div>
        ${this.filters.length > 1
          ? html`<div class="filters">
              <hacs-filter .hacs=${this.hacs} .filters="${this.filters}"></hacs-filter>
            </div>`
          : ""}
        <div class=${classMap({ content: true, narrow: this.narrow })} @scroll=${this._loadMore}>
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
                          loading="lazy"
                          .src=${brandsUrl({
                            domain: repo.domain,
                            darkOptimized: this.hass.themes.darkMode,
                            type: "icon",
                          })}
                          referrerpolicy="no-referrer"
                          @error=${this._onImageError}
                          @load=${this._onImageLoad}
                        />
                      `
                    : html`<ha-svg-icon .path=${mdiGithub} slot="item-icon"></ha-svg-icon>`}
                  <paper-item-body two-line
                    >${repo.name}
                    <div class="category-chip">
                      <ha-chip>${this.hacs.localize(`common.${repo.category}`)}</ha-chip>
                    </div>
                    <div secondary>${repo.description}</div>
                  </paper-item-body>
                </paper-icon-item>`
              )}
            ${repositories.length === 0
              ? html`<p>${this.hacs.localize("dialog_add_repo.no_match")}</p>`
              : ""}
          </div>
        </div>
      </hacs-dialog>
    `;
  }

  private _loadMore(ev) {
    const top = ev.target.scrollTop;
    if (top >= this._top) {
      this._load += 1;
    } else {
      this._load -= 1;
    }
    this._top = top;
  }

  private _inputValueChanged(ev: any) {
    this._searchInput = ev.detail.value;
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
      ev.target.outerHTML = `<ha-svg-icon path="${mdiGithub}" slot="item-icon"></ha-svg-icon>`;
    }
  }

  static get styles() {
    return [
      searchStyles,
      scrollBarStyle,
      hacsIconStyle,
      css`
        .content {
          width: 100%;
          overflow: auto;
          max-height: 70vh;
        }

        .filter {
          margin-top: -12px;
          display: flex;
          width: 200px;
          float: right;
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
        ha-svg-icon {
          --mdc-icon-size: 36px;
        }
        search-input {
          float: left;
          width: 60%;
          border-bottom: 1px var(--mdc-theme-primary) solid;
        }
        search-input[narrow],
        div.filter[narrow],
        ha-paper-dropdown-menu[narrow] {
          width: 100%;
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

        ha-paper-dropdown-menu {
          margin: 0 12px 4px 0;
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
        .filters {
          width: 100%;
          display: flex;
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

        hacs-filter {
          width: 100%;
          margin-left: -32px;
        }
        div[secondary] {
          width: 88%;
        }
      `,
    ];
  }
}
