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
  mdiPlus,
} from "@mdi/js";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import type { CSSResultGroup, PropertyValues, TemplateResult } from "lit";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import memoize from "memoize-one";
import { relativeTime } from "../../homeassistant-frontend/src/common/datetime/relative_time";
import { storage } from "../../homeassistant-frontend/src/common/decorators/storage";
import { mainWindow } from "../../homeassistant-frontend/src/common/dom/get_main_window";
import { stopPropagation } from "../../homeassistant-frontend/src/common/dom/stop_propagation";
import { navigate } from "../../homeassistant-frontend/src/common/navigate";
import type {
  DataTableColumnContainer,
  SortingDirection,
} from "../../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../../homeassistant-frontend/src/layouts/hass-tabs-subpage-data-table";

import "../../homeassistant-frontend/src/components/ha-button-menu";
import "../../homeassistant-frontend/src/components/ha-check-list-item";
import "../../homeassistant-frontend/src/components/ha-fab";
import "../../homeassistant-frontend/src/components/ha-formfield";
import "../../homeassistant-frontend/src/components/ha-markdown";
import "../../homeassistant-frontend/src/components/ha-radio";
import "../../homeassistant-frontend/src/components/ha-select";

import { LocalizeFunc } from "../../homeassistant-frontend/src/common/translations/localize";
import "../../homeassistant-frontend/src/components/ha-icon-overflow-menu";
import { IconOverflowMenuItem } from "../../homeassistant-frontend/src/components/ha-icon-overflow-menu";
import "../../homeassistant-frontend/src/components/ha-svg-icon";
import { showConfirmationDialog } from "../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import type { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { brandsUrl } from "../../homeassistant-frontend/src/util/brands-url";
import {
  showHacsCustomRepositoriesDialog,
  showHacsFormDialog,
} from "../components/dialogs/show-hacs-dialog";
import { repositoryMenuItems } from "../components/hacs-repository-owerflow-menu";
import { aboutHacsmarkdownContent } from "../data/about";
import type { Hacs } from "../data/hacs";
import { APP_FULL_NAME } from "../data/hacs";
import { HacsLocalizeKeys } from "../data/localize";
import type { RepositoryBase, RepositoryCategory } from "../data/repository";
import { repositoriesClearNew } from "../data/websocket";
import { HacsStyles } from "../styles/hacs-common-style";
import { categoryIcon } from "../tools/category-icon";
import { documentationUrl } from "../tools/documentation";

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

type tableColumnDefaultsType = keyof typeof tableColumnDefaults;

const defaultKeyData = {
  title: "",
  hidden: true,
  filterable: true,
};

@customElement("hacs-dashboard")
export class HacsDashboard extends LitElement {
  @property({ attribute: false }) public hacs!: Hacs;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public route!: Route;

  @property({ type: Boolean, reflect: true })
  public narrow!: boolean;

  @property({ type: Boolean }) public isWide!: boolean;

  @storage({ key: "hacs-table-filter", state: true, subscribe: false })
  private activeFilters?: string[] = [];

  @storage({ key: "hacs-table-sort", state: true, subscribe: false })
  private activeSort?: { column: string; direction: SortingDirection };

  @storage({ key: "hacs-active-search", state: true, subscribe: false })
  private _activeSearch?: string;

  @storage({ key: "hacs-table-scroll", state: true, subscribe: false })
  private _tableScroll?: number;

  @storage({ key: "hacs-hide-browse-fab", state: true, subscribe: false })
  private _hide_browse_fab?: boolean;

  @storage({ key: "hacs-table-active-columns", state: true, subscribe: false })
  private _tableColumns: Record<tableColumnDefaultsType, boolean> = tableColumnDefaults;

  public connectedCallback(): void {
    super.connectedCallback();
    const baseFilters =
      this.activeFilters && this.activeFilters.length === 0 ? ["downloaded"] : this.activeFilters;

    const filters = !this._activeSearch?.length
      ? baseFilters
      : baseFilters?.filter((filter) => filter !== "downloaded");
    this.activeFilters = filters?.length ? filters : undefined;

    this.updateComplete.then(() => {
      this.restoreScroller().catch(() => {
        // Ignored
      });
    });
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has("_activeSearch") && this._activeSearch?.length) {
      this.activeFilters = this.activeFilters?.filter((filter) => filter !== "downloaded");
    }
  }

  protected render = (): TemplateResult | void => {
    const showFab =
      !this._hide_browse_fab &&
      this.activeFilters !== undefined &&
      this.activeFilters.length === 1 &&
      this.activeFilters[0] === "downloaded";
    const repositories = this._filterRepositories(this.hacs.repositories, this.activeFilters);
    const repositoriesContainsNew =
      repositories.filter((repository) => repository.new).length !== 0;

    return html`<hass-tabs-subpage-data-table
      .tabs=${[
        {
          name: APP_FULL_NAME,
        },
      ]}
      .columns=${this._columns(this.narrow, this._tableColumns, this.hacs.localize)}
      .data=${repositories}
      .hass=${this.hass}
      isWide=${this.isWide}
      .localizeFunc=${this.hass.localize}
      .mainPage=${true}
      .narrow=${this.narrow}
      .route=${this.route}
      clickable
      .filter=${this._activeSearch}
      .activeFilters=${this.activeFilters?.map(
        (filter) =>
          this.hacs.localize(
            // @ts-ignore
            `common.${filter.startsWith("category_") ? filter.replace("category_", "") : filter}`
          ) || filter
      )}
      .noDataText=${this.activeFilters?.includes("downloaded")
        ? "No downloaded repositories"
        : "No repositories matching search"}
      @row-click=${this._handleRowClicked}
      @clear-filter=${this._handleClearFilter}
      @value-changed=${this._handleSearchFilterChanged}
      @sorting-changed=${this._handleSortingChanged}
      .hasFab=${showFab}
    >
      <ha-icon-overflow-menu
        narrow
        slot="toolbar-icon"
        .hass=${this.hass}
        .items=${[
          {
            path: mdiFileDocument,
            label: this.hacs.localize("menu.documentation"),
            action: () =>
              mainWindow.open(
                documentationUrl({ experimental: this.hacs.info.experimental }),
                "_blank",
                "noreferrer=true"
              ),
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
              mainWindow.open(
                documentationUrl({
                  experimental: this.hacs.info.experimental,
                  path: "/docs/issues",
                }),
                "_blank",
                "noreferrer=true"
              ),
          },
          {
            path: mdiGit,
            disabled: Boolean(this.hacs.info.disabled_reason),
            label: this.hacs.localize("menu.custom_repositories"),
            action: () => {
              showHacsCustomRepositoriesDialog(this, {
                hacs: this.hacs,
              });
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
              showHacsFormDialog(this, {
                hacs: this.hacs,
                title: APP_FULL_NAME,
                description: html`<ha-markdown
                  .content=${aboutHacsmarkdownContent(this.hacs)}
                ></ha-markdown>`,
              });
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
          .selected=${this.activeFilters?.includes("downloaded") ?? false}
          left
        >
          ${this.hacs.localize("common.downloaded")}
        </ha-check-list-item>
        <ha-check-list-item
          @request-selected=${this._handleNewFilterChange}
          graphic="control"
          .selected=${this.activeFilters?.includes("new") ?? false}
          left
        >
          ${this.hacs.localize("common.new")}
        </ha-check-list-item>
        ${!this.narrow
          ? html`
              <ha-select
                label="Category filter"
                @selected=${this._handleCategoryFilterChange}
                @closed=${stopPropagation}
                naturalMenuWidth
                .value=${this.activeFilters?.find((filter) => filter.startsWith("category_")) || ""}
              >
                ${this.hacs.info.categories.map(
                  (category) =>
                    html`
                      <mwc-list-item .value="${`category_${category}`}">
                        ${this.hacs.localize(`common.${category}`)}
                      </mwc-list-item>
                    `
                )}
              </ha-select>
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
                    ${this.hacs.localize(`column.${entry as tableColumnDefaultsType}`)}
                  </ha-check-list-item>
                `
              )}
            `
          : this.hacs.info.categories.map(
              (category) => html`
                <ha-formfield .label=${this.hacs.localize(`common.${category}`)}>
                  <ha-radio
                    @change=${this._handleCategoryFilterChange}
                    .value=${`category_${category}`}
                    name="category"
                    .checked=${this.activeFilters?.some(
                      (filter) => filter === `category_${category}`
                    ) ?? false}
                  >
                  </ha-radio>
                </ha-formfield>
              `
            )}
      </ha-button-menu>
      ${showFab
        ? html`
            <ha-fab
              slot="fab"
              @click=${this._show_browse_dialog}
              .label=${this.hacs.localize("dialog_browse.btn")}
              extended
            >
              <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
            </ha-fab>
          `
        : nothing}
    </hass-tabs-subpage-data-table>`;
  };

  _show_browse_dialog = async () => {
    showConfirmationDialog(this, {
      title: this.hacs.localize("dialog_browse.title"),
      text: this.hacs.localize("dialog_browse.content"),
      confirmText: this.hacs.localize("common.close"),
      confirm: () => {
        this._hide_browse_fab = true;
      },
      dismissText: this.hacs.localize("menu.documentation"),
      cancel: () => {
        mainWindow.open(
          documentationUrl({
            experimental: this.hacs.info.experimental,
            path: "/docs/basic/dashboard",
          }),
          "_blank",
          "noreferrer=true"
        );

        this._show_browse_dialog();
      },
    });
  };

  private _filterRepositories = memoize(
    (repositories: RepositoryBase[], activeFilters?: string[]): RepositoryBase[] =>
      repositories
        .filter((repository) => {
          if (this.activeFilters?.includes("downloaded") && !repository.installed) {
            return false;
          }
          if (this.activeFilters?.includes("new") && !repository.new) {
            return false;
          }
          if (
            activeFilters?.filter((filter) => filter.startsWith("category_")).length &&
            !activeFilters.includes(`category_${repository.category}`)
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
      tableColumnsOptions: { [key: string]: boolean },
      localizeFunc: LocalizeFunc<HacsLocalizeKeys>
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
        title: localizeFunc("column.name"),
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
            ${!this.activeFilters?.includes("downloaded") && repository.installed
              ? html`<ha-svg-icon
                  label="Downloaded"
                  style="color: var(--primary-color); margin-right: 4px;"
                  .path=${mdiDownload}
                ></ha-svg-icon>`
              : ""}
            ${name}
            <div class="secondary">
              ${narrow ? localizeFunc(`common.${repository.category}`) : repository.description}
            </div>
          `,
      },
      downloads: {
        ...defaultKeyData,
        title: localizeFunc("column.downloads"),
        hidden: narrow || !tableColumnsOptions.downloads,
        sortable: true,
        direction: this.activeSort?.column === "downloads" ? this.activeSort.direction : null,
        width: "10%",
        template: (downloads: number) => html`${downloads || "-"}`,
      },
      stars: {
        ...defaultKeyData,
        title: localizeFunc("column.stars"),
        hidden: narrow || !tableColumnsOptions.stars,
        sortable: true,
        direction: this.activeSort?.column === "stars" ? this.activeSort.direction : null,
        width: "10%",
      },
      last_updated: {
        ...defaultKeyData,
        title: localizeFunc("column.last_updated"),
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
        title: localizeFunc("column.installed_version"),
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
        title: localizeFunc("column.available_version"),
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
        title: localizeFunc("column.status"),
        hidden: narrow || !tableColumnsOptions.status,
        sortable: true,
        direction: this.activeSort?.column === "status" ? this.activeSort.direction : null,
        width: "10%",
        template: (status: RepositoryBase["status"]) =>
          ["pending-restart", "pending-upgrade"].includes(status)
            ? localizeFunc(`repository_status.${status as "pending-restart" | "pending-upgrade"}`)
            : "-",
      },
      category: {
        ...defaultKeyData,
        title: localizeFunc("column.category"),
        hidden: narrow || !tableColumnsOptions.category,
        sortable: true,
        direction: this.activeSort?.column === "category" ? this.activeSort.direction : null,
        width: "10%",
        template: (category: RepositoryCategory) => localizeFunc(`common.${category}`),
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

  get _scrollerTarget() {
    return (
      this.shadowRoot
        ?.querySelector("hass-tabs-subpage-data-table")
        ?.shadowRoot?.querySelector("hass-tabs-subpage")
        ?.shadowRoot?.querySelector(".content")
        ?.querySelectorAll("SLOT")[0]
        // @ts-ignore
        ?.assignedNodes()
        ?.find((node) => node.nodeName === "HA-DATA-TABLE")
        ?.shadowRoot?.querySelector(".scroller")
    );
  }

  private async restoreScroller() {
    if ((this._tableScroll ?? 0) === 0) {
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(reject, 1000);
      const intervalCheck = setInterval(() => {
        if (this._scrollerTarget) {
          this._scrollerTarget.scrollTop = this._tableScroll;
          clearTimeout(timeout);
          clearInterval(intervalCheck);
          resolve();
        }
      }, 50);
    });
  }

  private _handleRowClicked(ev: CustomEvent) {
    this._tableScroll = this._scrollerTarget?.scrollTop || 0;
    navigate(`/hacs/repository/${ev.detail.id}`);
  }

  private _handleCategoryFilterChange(ev: CustomEvent) {
    ev.stopPropagation();
    const categoryFilter = (ev.target as any).value;
    if (categoryFilter) {
      if ((ev.target as any).nodeName === "HA-RADIO" && (ev.target as any).checked === false) {
        this.activeFilters = [
          ...(this.activeFilters?.filter(
            (filter) => !filter.startsWith("category_") && filter !== categoryFilter
          ) || []),
        ];
      } else {
        this.activeFilters = [
          ...(this.activeFilters?.filter(
            (filter) => !filter.startsWith("category_") && filter !== categoryFilter
          ) || []),
          categoryFilter,
        ];
      }
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
    ) as Record<tableColumnDefaultsType, boolean>;
  }

  private _handleSortingChanged(ev: CustomEvent) {
    this.activeSort = ev.detail;
  }

  private _handleDownloadFilterChange(ev: CustomEvent) {
    const updatedFilters = this.activeFilters?.filter((filter) => filter !== "downloaded") || [];
    if (ev.detail.selected) {
      updatedFilters.push("downloaded");
    }
    this.activeFilters = updatedFilters.length ? updatedFilters : undefined;
  }

  private _handleNewFilterChange(ev: CustomEvent) {
    const updatedFilters = this.activeFilters?.filter((filter) => filter !== "new") || [];
    if (ev.detail.selected) {
      updatedFilters.push("new");
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
        ha-formfield {
          padding: 0 4px 0 16px;
        }
      `,
    ];
  }
}
