import "@material/mwc-button/mwc-button";
import "@material/mwc-list/mwc-list";
import "@material/mwc-list/mwc-list-item";
import {
  mdiAlertCircleOutline,
  mdiDownload,
  mdiFileDocument,
  mdiFilterVariant,
  mdiGit,
  mdiGithub,
  mdiInformation,
  mdiNewBox,
} from "@mdi/js";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import memoize from "memoize-one";
import { relativeTime } from "../../homeassistant-frontend/src/common/datetime/relative_time";
import { LocalStorage } from "../../homeassistant-frontend/src/common/decorators/local-storage";
import { mainWindow } from "../../homeassistant-frontend/src/common/dom/get_main_window";
import { stopPropagation } from "../../homeassistant-frontend/src/common/dom/stop_propagation";
import { navigate } from "../../homeassistant-frontend/src/common/navigate";
import type {
  DataTableColumnContainer,
  SortingDirection,
} from "../../homeassistant-frontend/src/components/data-table/ha-data-table";

import "../../homeassistant-frontend/src/components/ha-button-menu";
import "../../homeassistant-frontend/src/components/ha-check-list-item";
import "../../homeassistant-frontend/src/components/ha-select";
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
import { categoryIcon } from "../tools/category-icon";

const tableColumnDefaults = {
  name: true,
  downloads: true,
  stars: true,
  last_updated: true,
  installed_version: false,
  available_version: false,
  status: false,
  category: true,
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

  @LocalStorage("hacs-table-filters", true, false)
  private activeFilters?: string[] = [];

  @LocalStorage("hacs-table-sort", true, false)
  private activeSort?: { column: string; direction: SortingDirection };

  @LocalStorage("hacs-active-search", true, false)
  private _activeSearch?: string;

  @LocalStorage("hacs-table-active-columns", true, false)
  private _tableColumns: { [key: string]: boolean } = tableColumnDefaults;

  protected async firstUpdated(changedProperties: PropertyValues): Promise<void> {
    super.firstUpdated(changedProperties);
    const baseFilters =
      this.activeFilters && this.activeFilters.length === 0
        ? [this.hacs.localize("common.downloaded")]
        : this.activeFilters;

    const filters = !this._activeSearch?.length
      ? baseFilters
      : baseFilters?.filter((filter) => filter !== this.hacs.localize("common.downloaded"));
    this.activeFilters = filters?.length ? filters : undefined;
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has("_activeSearch") && this._activeSearch?.length) {
      this.activeFilters = this.activeFilters?.filter(
        (filter) => filter !== this.hacs.localize("common.downloaded")
      );
    }
  }

  protected render = (): TemplateResult | void => {
    const repositories = this._filterRepositories(this.hacs.repositories, this.activeFilters);
    const repositoriesContainsNew =
      repositories.filter((repository) => repository.new).length !== 0;

    return html`<hacs-tabs-subpage-data-table
      .tabs=${[
        {
          name: "Home Assistant Community Store",
          path: `/hacs/dashboard`,
          iconPath: hacsIcon,
        },
      ]}
      .columns=${this._columns(this.narrow, this._tableColumns)}
      .data=${repositories}
      .hass=${this.hass}
      isWide=${this.isWide}
      .localizeFunc=${this.hass.localize}
      .mainPage=${true}
      .narrow=${this.narrow}
      .route=${this.route}
      clickable
      .filter=${this._activeSearch}
      .activeFilters=${this.activeFilters}
      .hasFab=${this.activeFilters?.includes(this.hacs.localize("common.downloaded"))}
      .noDataText=${this.activeFilters?.includes(this.hacs.localize("common.downloaded"))
        ? "No downloaded repositories"
        : "No repositories matching search"}
      @row-click=${this._handleRowClicked}
      @clear-filter=${this._handleClearFilter}
      @value-changed=${this._handleSearchFilterChanged}
      @sorting-changed=${this._handleSortingChanged}
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
          repositoriesContainsNew
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

        ${!this.narrow ? html`<p class="menu_header">Filters</p>` : ""}
        <ha-check-list-item
          @request-selected=${this._handleDownloadFilterChange}
          graphic="control"
          .selected=${this.activeFilters?.includes(this.hacs.localize("common.downloaded")) ??
          false}
          left
        >
          ${this.hacs.localize("common.downloaded")}
        </ha-check-list-item>
        ${repositoriesContainsNew
          ? html`
              <ha-check-list-item
                @request-selected=${this._handleNewFilterChange}
                graphic="control"
                .selected=${this.activeFilters?.includes(this.hacs.localize("common.new")) ?? false}
                left
              >
                ${this.hacs.localize("common.new")}
              </ha-check-list-item>
            `
          : ""}

        <ha-select
          label="Category filter"
          @selected=${this._handleCategoryFilterChange}
          @closed=${stopPropagation}
          naturalMenuWidth
          .value=${this.activeFilters?.find((filter) =>
            filter.startsWith(`${this.hacs.localize(`dialog_custom_repositories.category`)}: `)
          ) || ""}
        >
          ${this.hacs.info.categories.map(
            (category) =>
              html`
                <mwc-list-item
                  .value="${this.hacs.localize(
                    `dialog_custom_repositories.category`
                  )}: ${this.hacs.localize(`common.${category}`)}"
                >
                  ${this.hacs.localize(`common.${category}`)}
                </mwc-list-item>
              `
          )}
        </ha-select>
        ${!this.narrow
          ? html`
              <div class="divider"></div>
              <p class="menu_header">Columns</p>
              ${Object.keys(tableColumnDefaults).map(
                (entry) => html`
                  <ha-check-list-item
                    @request-selected=${this._handleColumnChange}
                    graphic="control"
                    .column=${entry}
                    .selected=${this._tableColumns[entry] ?? tableColumnDefaults[entry]}
                    left
                  >
                    ${this.hacs.localize(`column.${entry}`)}
                  </ha-check-list-item>
                `
              )}
            `
          : ""}
      </ha-button-menu>
    </hacs-tabs-subpage-data-table>`;
  };

  private _exploreFabClicked = () => {
    const newFilters = this.activeFilters?.filter(
      (filter) => filter !== this.hacs.localize("common.downloaded")
    );
    this.activeFilters = newFilters?.length ? newFilters : undefined;
  };

  private _filterRepositories = memoize(
    (repositories: RepositoryBase[], activeFilters?: string[]): RepositoryBase[] =>
      repositories
        .filter((reposiotry) => {
          if (
            this.activeFilters?.includes(this.hacs.localize("common.downloaded")) &&
            !reposiotry.installed
          ) {
            return false;
          }
          if (this.activeFilters?.includes(this.hacs.localize("common.new")) && !reposiotry.new) {
            return false;
          }
          if (
            activeFilters?.filter((filter) =>
              filter.startsWith(this.hacs.localize(`dialog_custom_repositories.category`))
            ).length &&
            !activeFilters.includes(
              `${this.hacs.localize(`dialog_custom_repositories.category`)}: ${this.hacs.localize(
                `common.${reposiotry.category}`
              )}`
            )
          ) {
            return false;
          }
          return true;
        })
        .sort((a, b) => b.name.localeCompare(a.name))
        .sort((a, b) => (a.stars < b.stars ? 1 : -1))
        .sort((a, b) => (a.installed && !b.installed ? 1 : -1))
        .sort((a, b) => (!a.new && b.new ? 1 : -1))
  );

  private _columns = memoize(
    (
      narrow: boolean,
      tableColumnsOptions: { [key: string]: boolean }
    ): DataTableColumnContainer<RepositoryBase> => ({
      icon: {
        title: "",
        label: this.hass.localize("ui.panel.config.lovelace.dashboards.picker.headers.icon"),
        hidden: this.narrow,
        type: "icon",
        template: (_, repository: RepositoryBase) =>
          repository.category === "integration"
            ? html`
                <img
                  style="height: 32px; width: 32px"
                  slot="item-icon"
                  src=${brandsUrl({
                    domain: repository.domain || "invalid",
                    type: "icon",
                    useFallback: true,
                    darkOptimized: this.hass.themes?.darkMode,
                  })}
                  referrerpolicy="no-referrer"
                />
              `
            : html`
                <ha-svg-icon
                  style="height: 32px; width: 32px; fill: var(--secondary-text-color);"
                  slot="item-icon"
                  .path=${categoryIcon(repository.category)}
                ></ha-svg-icon>
              `,
      },
      name: {
        ...defaultKeyData,
        title: this.hacs.localize("column.name"),
        main: true,
        sortable: true,
        direction: this.activeSort?.column === "name" ? this.activeSort.direction : null,
        hidden: !tableColumnsOptions.name,
        grows: true,
        template: (name, repository: RepositoryBase) =>
          html`
            ${repository.new
              ? html`<ha-svg-icon
                  label="New"
                  style="color: var(--primary-color); margin-right: 4px;"
                  .path=${mdiNewBox}
                ></ha-svg-icon>`
              : ""}
            ${!this.activeFilters?.includes(this.hacs.localize("common.downloaded")) &&
            repository.installed
              ? html`<ha-svg-icon
                  label="Downloaded"
                  style="color: var(--primary-color); margin-right: 4px;"
                  .path=${mdiDownload}
                ></ha-svg-icon>`
              : ""}
            ${name}
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
        hidden: narrow || !tableColumnsOptions.downloads,
        sortable: true,
        direction: this.activeSort?.column === "downloads" ? this.activeSort.direction : null,
        width: "10%",
        template: (downloads: number) => html`${downloads || "-"}`,
      },
      stars: {
        ...defaultKeyData,
        title: this.hacs.localize("column.stars"),
        hidden: narrow || !tableColumnsOptions.stars,
        sortable: true,
        direction: this.activeSort?.column === "stars" ? this.activeSort.direction : null,
        width: "10%",
      },
      last_updated: {
        ...defaultKeyData,
        title: this.hacs.localize("column.last_updated"),
        hidden: narrow || !tableColumnsOptions.last_updated,
        sortable: true,
        direction: this.activeSort?.column === "last_updated" ? this.activeSort.direction : null,
        width: "15%",
        template: (last_updated: string, _: RepositoryBase) => {
          try {
            return relativeTime(new Date(last_updated), this.hass.locale);
          } catch (e) {
            return "-";
          }
        },
      },
      installed_version: {
        ...defaultKeyData,
        title: this.hacs.localize("column.installed_version"),
        hidden: narrow || !tableColumnsOptions.installed_version,
        sortable: true,
        direction:
          this.activeSort?.column === "installed_version" ? this.activeSort.direction : null,
        width: "10%",
        template: (installed_version: string, repository: RepositoryBase) =>
          repository.installed ? installed_version : "-",
      },
      available_version: {
        ...defaultKeyData,
        title: this.hacs.localize("column.available_version"),
        hidden: narrow || !tableColumnsOptions.available_version,
        sortable: true,
        direction:
          this.activeSort?.column === "available_version" ? this.activeSort.direction : null,
        width: "10%",
        template: (available_version: string, repository: RepositoryBase) =>
          repository.installed ? available_version : "-",
      },
      status: {
        ...defaultKeyData,
        title: this.hacs.localize("column.status"),
        hidden: narrow || !tableColumnsOptions.status,
        sortable: true,
        direction: this.activeSort?.column === "status" ? this.activeSort.direction : null,
        width: "10%",
        template: (status: string) =>
          ["pending-restart", "pending-upgrade"].includes(status)
            ? this.hacs.localize(`repository_status.${status}`)
            : "-",
      },
      category: {
        ...defaultKeyData,
        title: this.hacs.localize("column.category"),
        hidden: narrow || !tableColumnsOptions.category,
        sortable: true,
        direction: this.activeSort?.column === "category" ? this.activeSort.direction : null,
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
        type: "overflow-menu",
        template: (_, repository: RepositoryBase) =>
          repository.installed
            ? html`
                <ha-icon-overflow-menu
                  .hass=${this.hass}
                  .items=${repositoryMenuItems(this, repository) as IconOverflowMenuItem[]}
                  narrow
                >
                </ha-icon-overflow-menu>
              `
            : "",
      },
    })
  );

  private _handleRowClicked(ev: CustomEvent) {
    navigate(`/hacs/repository/${ev.detail.id}`);
  }

  private _handleCategoryFilterChange(ev: CustomEvent) {
    ev.stopPropagation();
    const categoryFilter = (ev.target as any).value;
    if (categoryFilter) {
      this.activeFilters = [
        ...(this.activeFilters?.filter(
          (filter) =>
            !filter.startsWith(this.hacs.localize(`dialog_custom_repositories.category`)) &&
            filter !== categoryFilter
        ) || []),
        categoryFilter,
      ];
    }
  }

  private _handleSearchFilterChanged(ev: CustomEvent) {
    this._activeSearch = ev.detail.value;
  }

  private _handleColumnChange(ev: CustomEvent) {
    ev.stopPropagation();
    const update = {
      ...this._tableColumns,
      [(ev.currentTarget as any).column]: ev.detail.selected,
    };
    this._tableColumns = Object.keys(tableColumnDefaults).reduce(
      (entries, key) => ({
        ...entries,
        [key]: update[key] ?? tableColumnDefaults[key],
      }),
      {}
    );
  }

  private _handleSortingChanged(ev: CustomEvent) {
    this.activeSort = ev.detail;
  }

  private _handleDownloadFilterChange(ev: CustomEvent) {
    const updatedFilters =
      this.activeFilters?.filter(
        (filter) => !filter.startsWith(this.hacs.localize("common.downloaded"))
      ) || [];
    if (ev.detail.selected) {
      updatedFilters.push(this.hacs.localize("common.downloaded"));
    }
    this.activeFilters = updatedFilters.length ? updatedFilters : undefined;
  }

  private _handleNewFilterChange(ev: CustomEvent) {
    const updatedFilters =
      this.activeFilters?.filter(
        (filter) => !filter.startsWith(this.hacs.localize("common.new"))
      ) || [];
    if (ev.detail.selected) {
      updatedFilters.push(this.hacs.localize("common.new"));
    }
    this.activeFilters = updatedFilters.length ? updatedFilters : undefined;
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
        ha-select {
          margin: 8px;
        }
      `,
    ];
  }
}
