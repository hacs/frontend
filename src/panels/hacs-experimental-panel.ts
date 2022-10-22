import "@material/mwc-button/mwc-button";
import "@material/mwc-list/mwc-list";
import "@material/mwc-list/mwc-list-item";
import {
  mdiAlertCircleOutline,
  mdiFileDocument,
  mdiFilterVariant,
  mdiGit,
  mdiGithub,
  mdiInformation,
  mdiNewBox,
  mdiPlus,
} from "@mdi/js";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoize from "memoize-one";
import { relativeTime } from "../../homeassistant-frontend/src/common/datetime/relative_time";
import { LocalStorage } from "../../homeassistant-frontend/src/common/decorators/local-storage";
import { mainWindow } from "../../homeassistant-frontend/src/common/dom/get_main_window";
import { navigate } from "../../homeassistant-frontend/src/common/navigate";
import type { DataTableColumnContainer } from "../../homeassistant-frontend/src/components/data-table/ha-data-table";

import "../../homeassistant-frontend/src/components/ha-button-menu";
import "../../homeassistant-frontend/src/components/ha-check-list-item";
import "../../homeassistant-frontend/src/components/ha-fab";
import { IconOverflowMenuItem } from "../../homeassistant-frontend/src/components/ha-icon-overflow-menu";
import "../../homeassistant-frontend/src/components/ha-menu-button";
import "../../homeassistant-frontend/src/components/ha-svg-icon";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import type { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { brandsUrl } from "../../homeassistant-frontend/src/util/brands-url";
import { showDialogAbout } from "../components/dialogs/hacs-about-dialog";
import { hacsIcon } from "../components/hacs-icon";
import { repositoryMenuItems } from "../components/hacs-repository-owerflow-menu";
import "../components/hacs-tabs-subpage-data-table";
import type { Hacs } from "../data/hacs";
import type { RepositoryBase } from "../data/repository";
import { repositoriesClearNew } from "../data/websocket";
import { HacsStyles } from "../styles/hacs-common-style";

interface TableColumnsOptions {
  entry: { [key: string]: boolean };
  explore: { [key: string]: boolean };
}

const tableColumnDefaults = {
  entry: {
    name: true,
    downloads: false,
    stars: false,
    last_updated: false,
    category: true,
  },
  explore: {
    name: true,
    downloads: false,
    stars: false,
    last_updated: false,
    category: true,
  },
};

const defaultKeyData = {
  title: "",
  hidden: true,
  filterable: true,
};

@customElement("hacs-experimental-panel")
export class HacsExperimentalPanel extends LitElement {
  @property({ attribute: false }) public hacs!: Hacs;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public route!: Route;

  @property({ type: Boolean, reflect: true })
  public narrow!: boolean;

  @property({ type: Boolean }) public isWide!: boolean;

  @property({ attribute: false }) public section!: "entry" | "explore";

  @state() activeFilters?: string[];

  @LocalStorage("hacs-table-columns", true, false)
  private _tableColumns: TableColumnsOptions = tableColumnDefaults;

  protected render = (): TemplateResult | void => {
    const repositories = this._filterRepositories(
      this.hacs.repositories,
      this.section === "entry",
      this.activeFilters
    );
    const newRepositories = repositories.filter((repo) => repo.new);
    const restRepositories = repositories.filter((repo) => !repo.new);
    const hasNew = this.section === "explore" && newRepositories.length !== 0;

    return html`<hacs-tabs-subpage-data-table
      .tabs=${[
        {
          name:
            this.section === "entry"
              ? "Home Assistant Community Store - Downloaded"
              : "Home Assistant Community Store - Explore",
          path: `/hacs/entry`,
          iconPath: hacsIcon,
        },
      ]}
      .columns=${this._columns(this.narrow, hasNew, this._tableColumns)}
      .data=${newRepositories.concat(restRepositories)}
      .hass=${this.hass}
      isWide=${this.isWide}
      .localizeFunc=${this.hass.localize}
      .mainPage=${this.section === "entry"}
      .narrow=${this.narrow}
      .route=${this.route}
      clickable
      .activeFilters=${this.activeFilters}
      .hasFab=${this.section === "entry"}
      .noDataText=${this.section === "entry"
        ? "No downloaded repositories"
        : "No repositories matching search"}
      @row-click=${this._handleRowClicked}
      @clear-filter=${this._handleClearFilter}
    >
      <ha-icon-overflow-menu
        narrow
        slot="toolbar-icon"
        .hass=${this.hass}
        .items=${[
          {
            path: mdiFileDocument,
            label: this.hacs.localize("menu.documentation"),
            action: () => mainWindow.open(`https://hacs.xyz/`, "_blank", "noreferrer=true"),
          },
          {
            path: mdiGithub,
            label: "GitHub",
            action: () => mainWindow.open(`https://github.com/hacs`, "_blank", "noreferrer=true"),
          },
          {
            path: mdiAlertCircleOutline,
            label: this.hacs.localize("menu.open_issue"),
            action: () =>
              mainWindow.open(`https://hacs.xyz/docs/issues`, "_blank", "noreferrer=true"),
          },
          {
            path: mdiGit,
            disabled: Boolean(this.hacs.info.disabled_reason),
            label: this.hacs.localize("menu.custom_repositories"),
            action: () => {
              this.dispatchEvent(
                new CustomEvent("hacs-dialog", {
                  detail: {
                    type: "custom-repositories",
                    repositories: this.hacs.repositories,
                  },
                  bubbles: true,
                  composed: true,
                })
              );
            },
          },
          hasNew
            ? {
                path: mdiNewBox,
                label: this.hacs.localize("menu.dismiss"),
                action: () => {
                  repositoriesClearNew(this.hass, this.hacs);
                },
              }
            : undefined,
          {
            path: mdiInformation,
            label: this.hacs.localize("menu.about"),
            action: () => {
              showDialogAbout(this, this.hacs);
            },
          },
        ].filter((item) => item !== undefined) as IconOverflowMenuItem[]}
      >
      </ha-icon-overflow-menu>

      <ha-button-menu slot="filter-menu" corner="BOTTOM_START" multi>
        <ha-icon-button
          slot="trigger"
          .label=${this.hass.localize("ui.panel.config.entities.picker.filter.filter")}
          .path=${mdiFilterVariant}
        >
        </ha-icon-button>
        ${!this.narrow ? html`<p class="menu_header">Hide categories</p>` : " "}
        ${this.narrow && this.activeFilters?.length
          ? html`<mwc-list-item @click=${this._handleClearFilter}>
              ${this.hass.localize("ui.components.data-table.filtering_by")}
              ${this.activeFilters.join(", ")} <span class="clear">Clear</span>
            </mwc-list-item>`
          : ""}
        ${this.hacs.info.categories.map(
          (category) => html`
            <ha-check-list-item
              @request-selected=${this._handleCategoryFilterChange}
              .category=${category}
              .selected=${(this.activeFilters || []).includes(`Hide ${category}`)}
              left
            >
              ${this.hacs.localize(`common.${category}`)}
            </ha-check-list-item>
          `
        )}
        ${!this.narrow
          ? html`
              <div class="divider"></div>
              <p class="menu_header">Columns</p>
              ${Object.keys(tableColumnDefaults[this.section]).map(
                (entry) => html`
                  <ha-check-list-item
                    @request-selected=${this._handleColumnChange}
                    graphic="control"
                    .column=${entry}
                    .selected=${this._tableColumns[this.section][entry] ||
                    tableColumnDefaults[this.section][entry]}
                    left
                  >
                    ${this.hacs.localize(`column.${entry}`)}
                  </ha-check-list-item>
                `
              )}
            `
          : " "}
      </ha-button-menu>

      ${this.section === "entry"
        ? html`
            <a href="/hacs/explore" slot="fab">
              <ha-fab .label=${this.hacs.localize("common.explore")} .extended=${!this.narrow}>
                <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon> </ha-fab
            ></a>
          `
        : ""}
    </hacs-tabs-subpage-data-table>`;
  };

  private _filterRepositories = memoize(
    (
      repositories: RepositoryBase[],
      downloaded: boolean,
      activeFilters?: string[]
    ): RepositoryBase[] =>
      repositories
        .filter((reposiotry) => {
          if (activeFilters?.includes(`Hide ${reposiotry.category}`)) {
            return false;
          }
          return (!downloaded && !reposiotry.installed) || (downloaded && reposiotry.installed);
        })
        .sort((a, b) => (a.stars < b.stars ? 1 : -1))
  );

  private _columns = memoize(
    (
      narrow: boolean,
      hasNew: boolean,
      tableColumnsOptions: TableColumnsOptions
    ): DataTableColumnContainer<RepositoryBase> => ({
      icon: {
        title: "",
        label: this.hass.localize("ui.panel.config.lovelace.dashboards.picker.headers.icon"),
        hidden: this.narrow || this.section !== "entry",
        type: "icon",
        template: (_, repository: RepositoryBase) =>
          html`
            <img
              style="height: 32px; width: 32px"
              slot="item-icon"
              src=${brandsUrl({
                domain: repository.domain || "github",
                type: "icon",
                useFallback: true,
                darkOptimized: this.hass.themes?.darkMode,
              })}
              referrerpolicy="no-referrer"
            />
          `,
      },
      name: {
        ...defaultKeyData,
        title: this.hacs.localize("column.name"),
        main: true,
        sortable: true,
        direction: this.section === "explore" || hasNew ? undefined : "asc",
        hidden: !tableColumnsOptions[this.section].name,
        grows: true,
        template: (name, repository: RepositoryBase) =>
          html`
            ${repository.new
              ? html`<ha-svg-icon
                  style="color: var(--primary-color); margin-right: 4px;"
                  .path=${mdiNewBox}
                ></ha-svg-icon>`
              : ""}${name}<br />
            <div class="secondary">
              ${narrow
                ? this.hacs.localize(`common.${repository.category}`)
                : repository.description}
            </div>
          `,
      },
      downloads: {
        ...defaultKeyData,
        title: this.hacs.localize("column.downloads"),
        hidden: narrow || !tableColumnsOptions[this.section].downloads,
        sortable: true,
        width: "10%",
        template: (downloads: number) => html`${downloads || "-"}`,
      },
      stars: {
        ...defaultKeyData,
        title: this.hacs.localize("column.stars"),
        hidden: narrow || !tableColumnsOptions[this.section].stars,
        direction: this.section === "entry" || hasNew ? undefined : "desc",
        sortable: true,
        width: "10%",
      },
      last_updated: {
        ...defaultKeyData,
        title: this.hacs.localize("column.last_updated"),
        hidden: narrow || !tableColumnsOptions[this.section].last_updated,
        sortable: true,
        width: "15%",
        template: (last_updated: string) => relativeTime(new Date(last_updated), this.hass.locale),
      },
      category: {
        ...defaultKeyData,
        title: this.hacs.localize("column.category"),
        hidden: narrow || !tableColumnsOptions[this.section].category,
        sortable: true,
        width: "10%",
        template: (category: string) => this.hacs.localize(`common.${category}`),
      },
      authors: defaultKeyData,
      description: defaultKeyData,
      domain: defaultKeyData,
      full_name: defaultKeyData,
      id: defaultKeyData,
      topics: defaultKeyData,
      actions: {
        title: "",
        width: this.narrow ? undefined : "10%",
        hidden: this.section !== "entry",
        type: "overflow-menu",
        template: (_, repository: RepositoryBase) =>
          html`
            <ha-icon-overflow-menu
              .hass=${this.hass}
              .items=${repositoryMenuItems(this, repository)}
              narrow
            >
            </ha-icon-overflow-menu>
          `,
      },
    })
  );

  private _handleRowClicked(ev: CustomEvent) {
    navigate(`/hacs/repository/${ev.detail.id}`);
  }

  private _handleCategoryFilterChange(ev: CustomEvent) {
    ev.stopPropagation();
    const category = `Hide ${(ev.target as any).category}`;
    if (ev.detail.selected) {
      this.activeFilters = Array.from(new Set([...(this.activeFilters || []), category]));
      return;
    }
    this.activeFilters = this.activeFilters?.filter((item) => item !== category);
  }

  private _handleColumnChange(ev: CustomEvent) {
    ev.stopPropagation();
    const update = {
      ...this._tableColumns[this.section],
      [(ev.currentTarget as any).column]: ev.detail.selected,
    };

    this._tableColumns = {
      ...this._tableColumns,
      [this.section]: Object.keys(tableColumnDefaults[this.section]).reduce(
        (entries, key) => ({
          ...entries,
          [key]: update[key] || tableColumnDefaults[this.section][key],
        }),
        {}
      ),
    };
  }

  private _handleClearFilter() {
    this.activeFilters = undefined;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      HacsStyles,
      css`
        .menu_header {
          font-size: 14px;
          margin: 8px;
        }
        .divider {
          bottom: 112px;
          padding: 10px 0px;
        }
        .divider::before {
          content: " ";
          display: block;
          height: 1px;
          background-color: var(--divider-color);
        }
      `,
    ];
  }
}
