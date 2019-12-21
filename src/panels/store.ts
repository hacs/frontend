import {
  LitElement,
  CSSResultArray,
  TemplateResult,
  html,
  customElement,
  css,
  property
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";
import { HACS } from "../Hacs";
import { HacsStyle } from "../style/hacs-style";
import {
  Repository,
  Status,
  Configuration,
  ValueChangedEvent,
  Route,
  LovelaceConfig
} from "../types";

import { OviewItemBuilder } from "../misc/OviewItemBuilder";

@customElement("hacs-store")
export class HacsStore extends LitElement {
  @property({ type: Array }) public repositories!: Repository[];
  @property({ type: Object }) public configuration!: Configuration;
  @property({ type: Object }) public hacs!: HACS;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public lovelaceconfig: LovelaceConfig;
  @property({ type: Object }) public route!: Route;
  @property({ type: Object }) public status!: Status;
  @property() public store!: string;
  @property() private search: string = "";
  @property() private sort: string = "name-desc";

  SortRepo(a: Repository, b: Repository): boolean {
    const sorttype = this.sort.split("-")[1];
    const sortkey = this.sort.split("-")[0];
    if (sorttype === "desc") {
      if (sortkey === "stars") return a.stars < b.stars;
      if (sortkey === "last_updated") {
        return Date.parse(a.last_updated) < Date.parse(b.last_updated);
      }

      return a[sortkey] > b[sortkey];
    } else {
      if (sortkey === "stars") return a.stars > b.stars;
      if (sortkey === "last_updated") {
        return Date.parse(a.last_updated) > Date.parse(b.last_updated);
      }

      return a[sortkey] < b[sortkey];
    }
  }

  SetSortKey(ev: ValueChangedEvent) {
    const attr = ((ev as any).detail.item as HTMLElement).getAttribute("key");
    if (attr.length === 0) return;
    this.sort = attr;
    localStorage.setItem("hacs-sort", this.sort);
  }

  DoSearch(ev) {
    this.search = ev.composedPath()[0].value;
    localStorage.setItem("hacs-search", this.search);
  }

  clearSearch() {
    this.search = "";
    localStorage.setItem("hacs-search", this.search);
  }

  protected render(): TemplateResult | void {
    if (this.repositories === undefined)
      return html`
        <hacs-progressbar></hacs-progressbar>
      `;

    const builder = new OviewItemBuilder(
      this.hass,
      this.configuration,
      this.lovelaceconfig,
      this.status,
      this.route
    );
    var new_repositories = [];

    this.search = localStorage.getItem("hacs-search");
    this.sort = localStorage.getItem("hacs-sort");

    var repositories = this.repositories.filter(repository => {
      // Hide hidden repos from the store
      if (repository.hide) return false;

      // Check contry restrictions
      if (
        this.configuration.country !== "ALL" &&
        repository.country !== undefined
      ) {
        if (this.configuration.country !== repository.country) return false;
      }
      // Check if repository category matches store
      if (repository.category === this.store) {
        // Hide HACS from stores
        if (repository.id === "172733314") return false;

        // Search filter
        if (this.search !== "") {
          if (repository.name.toLowerCase().includes(this.search.toLowerCase()))
            return true;
          if (
            repository.description
              .toLowerCase()
              .includes(this.search.toLowerCase())
          )
            return true;
          if (
            repository.full_name
              .toLowerCase()
              .includes(this.search.toLowerCase())
          )
            return true;
          if (
            String(repository.authors)
              .toLowerCase()
              .includes(this.search.toLowerCase())
          )
            return true;
          if (
            String(repository.topics)
              .toLowerCase()
              .includes(this.search.toLowerCase())
          )
            return true;
          return false;
        }
        // Is this new?
        if (repository.new) new_repositories.push(repository);
        return true;
      }
      return false;
    });

    return html`
      <hacs-body>
        <div class="store-top">
          <paper-input
            class="search-bar padder"
            type="text"
            id="Search"
            @input=${this.DoSearch}
            placeholder="  ${this.hacs.localize("store.placeholder_search")}."
            autofocus
            .value=${this.search}
          >
            ${this.search.length > 0
              ? html`
                  <ha-icon
                    slot="suffix"
                    icon="mdi:close"
                    @click="${this.clearSearch}"
                  ></ha-icon>
                `
              : ""}
          </paper-input>
          <paper-dropdown-menu
            @iron-select="${this.SetSortKey}"
            class="sort padder"
            label="Sort"
          >
            <paper-listbox
              slot="dropdown-content"
              class="list"
              selected="${this.sort}"
              attr-for-selected="key"
              dir="rtl"
            >
              <paper-item class="listitem" key="last_updated-desc"
                >${this.hacs.localize(
                  "store.last_updated"
                )}&nbsp;(${this.hacs.localize("store.descending")})</paper-item
              >
              <paper-item class="listitem" key="last_updated-asc"
                >${this.hacs.localize(
                  "store.last_updated"
                )}&nbsp;(${this.hacs.localize("store.ascending")})</paper-item
              >
              <paper-item class="listitem" key="name-desc"
                >${this.hacs.localize("store.name")}&nbsp;(${this.hacs.localize(
                  "store.descending"
                )})</paper-item
              >
              <paper-item class="listitem" key="name-asc"
                >${this.hacs.localize("store.name")}&nbsp;(${this.hacs.localize(
                  "store.ascending"
                )})</paper-item
              >
              <paper-item class="listitem" key="stars-desc"
                >${this.hacs.localize(
                  "store.stars"
                )}&nbsp;(${this.hacs.localize("store.descending")})</paper-item
              >
              <paper-item class="listitem" key="stars-asc"
                >${this.hacs.localize(
                  "store.stars"
                )}&nbsp;(${this.hacs.localize("store.ascending")})</paper-item
              >
            </paper-listbox>
          </paper-dropdown-menu>
        </div>

        ${new_repositories.length !== 0
          ? html`
              <div class="card-group">
                <div class="leftspace grouptitle">
                  ${this.hacs.localize("store.new_repositories")}
                </div>
                ${new_repositories
                  .sort((a, b) => (this.SortRepo(a, b) ? 1 : -1))
                  .map(repository => {
                    return builder.render(repository);
                  })}
                <div class="card-group">
                  <hacs-button-clear-new
                    .hass=${this.hass}
                    .category=${this.store}
                  ></hacs-button-clear-new>
                </div>
              </div>
              <hr noshade />
            `
          : ""}

        <div class="card-group">
          ${repositories
            .sort((a, b) => (this.SortRepo(a, b) ? 1 : -1))
            .map(repository => {
              return builder.render(repository);
            })}
        </div>
      </hacs-body>
    `;
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
        ha-card {
          display: inline-block;
          cursor: pointer;
        }
        .padder {
          padding-left: 8px;
          padding-right: 8px;
        }
        .search-bar {
          display: block;
          width: 60%;
          background-color: var(--primary-background-color);
          color: var(--primary-text-color);
          line-height: 32px;
          border-color: var(--dark-primary-color);
          border-width: inherit;
          border-bottom-width: thin;
          border-radius: var(--ha-card-border-radius);
        }

        .sort {
          display: block;
          width: 30%;
          margin-left: 10%;
          background-color: var(--primary-background-color);
          color: var(--primary-text-color);
          line-height: 32px;
          border-color: var(--dark-primary-color);
          border-width: inherit;
          border-bottom-width: thin;
          border-radius: var(--ha-card-border-radius);
        }

        .store-top {
          display: flex;
          margin-top: -12px;
          max-width: 100%;
        }
        .card-content {
          width: calc(100% - 32px) !important;
        }
        paper-item.listitem {
          display: flex;
          background-color: var(
            --paper-listbox-background-color,
            var(--primary-background-color)
          );
        }
      `
    ];
  }
}
