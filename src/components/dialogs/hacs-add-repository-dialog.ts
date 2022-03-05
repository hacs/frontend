import "../../../homeassistant-frontend/src/components/search-input";
import "@material/mwc-list/mwc-list-item";
import "@material/mwc-select/mwc-select";
import { mdiGithub } from "@mdi/js";
import { css, html, PropertyValues, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { classMap } from "lit/directives/class-map";
import memoizeOne from "memoize-one";
import { stopPropagation } from "../../../homeassistant-frontend/src/common/dom/stop_propagation";
import "../../../homeassistant-frontend/src/components/ha-chip";
import "../../../homeassistant-frontend/src/components/ha-settings-row";
import "../../../homeassistant-frontend/src/components/ha-svg-icon";
import { brandsUrl } from "../../../homeassistant-frontend/src/util/brands-url";
import { Repository } from "../../data/common";
import { activePanel } from "../../panels/hacs-sections";
import { scrollBarStyle } from "../../styles/element-styles";
import { HacsStyles } from "../../styles/hacs-common-style";
import { filterRepositoriesByInput } from "../../tools/filter-repositories-by-input";
import "../hacs-filter";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";

const SORT_BY = ["stars", "last_updated", "name"];

@customElement("hacs-add-repository-dialog")
export class HacsAddRepositoryDialog extends HacsDialogBase {
  @property({ attribute: false }) public filters: any = [];

  @property({ type: Number }) private _load = 30;

  @property({ type: Number }) private _top = 0;

  @property() private _searchInput = "";

  @property() private _sortBy = SORT_BY[0];

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
        scrimClickAction
        maxWidth
      >
        <div class="searchandfilter" ?narrow=${this.narrow}>
          <search-input
            .hass=${this.hass}
            .label=${this.hacs.localize("search.placeholder")}
            .filter=${this._searchInput}
            @value-changed=${this._inputValueChanged}
            ?narrow=${this.narrow}
          ></search-input>
          <mwc-select
            ?narrow=${this.narrow}
            .label=${this.hacs.localize("dialog_add_repo.sort_by")}
            .value=${this._sortBy}
            @selected=${(ev) => (this._sortBy = ev.currentTarget.value)}
            @closed=${stopPropagation}
          >
            ${SORT_BY.map(
              (value) =>
                html`<mwc-list-item .value=${value}>
                  ${this.hacs.localize(`dialog_add_repo.sort_by_values.${value}`) || value}
                </mwc-list-item>`
            )}
          </mwc-select>
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
                (repo) => html` <ha-settings-row
                  class=${classMap({ narrow: this.narrow })}
                  @click=${() => this._openInformation(repo)}
                >
                  ${!this.narrow
                    ? repo.category === "integration"
                      ? html`
                          <img
                            slot="prefix"
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
                      : ""
                    : ""}
                  <span slot="heading"> ${repo.name} </span>
                  <span slot="description">${repo.description}</span>
                  ${repo.category !== "integration"
                    ? html`<ha-chip>${this.hacs.localize(`common.${repo.category}`)}</ha-chip> `
                    : ""}
                </ha-settings-row>`
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
    if (ev.target?.outerHTML) {
      try {
        ev.target.outerHTML = `<ha-svg-icon path="${mdiGithub}" slot="prefix"></ha-svg-icon>`;
      } catch (_) {
        // pass
      }
    }
  }

  static get styles() {
    return [
      scrollBarStyle,
      HacsStyles,
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
        ha-svg-icon {
          --mdc-icon-size: 36px;
          margin-right: 6px;
        }
        search-input {
          display: block;
          float: left;
          width: 75%;
        }
        search-input[narrow],
        mwc-select[narrow] {
          width: 100%;
          margin: 4px 0;
        }
        img {
          align-items: center;
          display: block;
          justify-content: center;
          margin-right: 6px;
          margin-bottom: 16px;
          max-height: 36px;
          max-width: 36px;
        }

        .filters {
          width: 100%;
          display: flex;
        }

        hacs-filter {
          width: 100%;
          margin-left: -32px;
        }

        ha-settings-row {
          padding: 0px 16px 0 0;
          cursor: pointer;
        }

        .searchandfilter {
          display: flex;
          justify-content: space-between;
          align-items: self-end;
        }

        .searchandfilter[narrow] {
          flex-direction: column;
        }
      `,
    ];
  }
}
