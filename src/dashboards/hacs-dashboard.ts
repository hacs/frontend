import "@material/mwc-button/mwc-button";
import "@material/mwc-list/mwc-list";
import "@material/mwc-list/mwc-list-item";
import {
  mdiAlertCircleOutline,
  mdiDownload,
  mdiFileDocument,
  mdiGit,
  mdiGithub,
  mdiInformation,
  mdiNewBox,
} from "@mdi/js";
import type { CSSResultGroup, TemplateResult } from "lit";
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators";
import memoize from "memoize-one";
import { relativeTime } from "../../homeassistant-frontend/src/common/datetime/relative_time";
import { storage } from "../../homeassistant-frontend/src/common/decorators/storage";
import { mainWindow } from "../../homeassistant-frontend/src/common/dom/get_main_window";
import { navigate } from "../../homeassistant-frontend/src/common/navigate";
import type {
  DataTableColumnContainer,
  SortingDirection,
} from "../../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../../homeassistant-frontend/src/layouts/hass-tabs-subpage-data-table";

import "../../homeassistant-frontend/src/components/ha-button-menu";
import "../../homeassistant-frontend/src/components/ha-fab";
import "../../homeassistant-frontend/src/components/ha-form/ha-form";
import "../../homeassistant-frontend/src/components/ha-markdown";

import { LocalizeFunc } from "../../homeassistant-frontend/src/common/translations/localize";
import { HaFormSchema } from "../../homeassistant-frontend/src/components/ha-form/types";
import "../../homeassistant-frontend/src/components/ha-icon-overflow-menu";
import { IconOverflowMenuItem } from "../../homeassistant-frontend/src/components/ha-icon-overflow-menu";
import "../../homeassistant-frontend/src/components/ha-svg-icon";
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
import type { RepositoryBase, RepositoryType } from "../data/repository";
import { repositoriesClearNew } from "../data/websocket";
import { HacsStyles } from "../styles/hacs-common-style";
import { documentationUrl } from "../tools/documentation";
import { typeIcon } from "../tools/type-icon";

const tableColumnDefaults = {
  downloads: true,
  stars: true,
  last_updated: true,
  installed_version: false,
  available_version: false,
  status: false,
  type: true,
};

type tableColumnDefaultsType = keyof typeof tableColumnDefaults;

const defaultKeyData = {
  title: "",
  hidden: true,
  filterable: true,
};

const STATUS_ORDER = ["pending-restart", "pending-upgrade", "installed", "new", "default"];

const TABS = [
  {
    name: APP_FULL_NAME,
  },
];

@customElement("hacs-dashboard")
export class HacsDashboard extends LitElement {
  @property({ attribute: false }) public hacs!: Hacs;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public route!: Route;

  @property({ type: Boolean, reflect: true })
  public narrow!: boolean;

  @property({ type: Boolean }) public isWide!: boolean;

  @storage({ key: "hacs-table-filter", state: true, subscribe: false })
  private _activeFilters?: string[] = [];

  @storage({ key: "hacs-table-sort", state: false, subscribe: false })
  private _activeSorting?: { column: string; direction: SortingDirection };

  @storage({ key: "hacs-table-grouping", state: true, subscribe: false })
  private _activeGrouping?: string;

  @storage({ key: "hacs-table-collapsed", state: false, subscribe: false })
  private _activeCollapsed?: string;

  @storage({ key: "hacs-active-search", state: true, subscribe: false })
  private _activeSearch?: string;

  @storage({ key: "hacs-table-active-columns", state: true, subscribe: false })
  private _tableColumns: Record<tableColumnDefaultsType, boolean> = tableColumnDefaults;

  protected render = (): TemplateResult | void => {
    const repositories = this._filterRepositories(
      this.hacs.repositories,
      this.hacs.localize,
      this._activeFilters,
    );
    const repositoriesContainsNew = repositories.some((repository) => repository.new);

    return html`<hass-tabs-subpage-data-table
      .tabs=${TABS}
      .columns=${this._columns(this.narrow, this._tableColumns, this.hacs.localize)}
      .data=${repositories}
      .hass=${this.hass}
      ?iswide=${this.isWide}
      .localizeFunc=${this.hass.localize}
      main-page
      .narrow=${this.narrow}
      .route=${this.route}
      clickable
      .filter=${this._activeSearch || ""}
      hasFilters
      .filters=${this._activeFilters?.length}
      .noDataText=${this.hacs.localize("dashboard.no_data")}
      .initialGroupColumn=${this._activeGrouping || "translated_status"}
      .initialCollapsedGroups=${this._activeCollapsed}
      .groupOrder=${this._groupOrder(this.hacs.localize, this._activeGrouping)}
      .initialSorting=${this._activeSorting}
      @row-click=${this._handleRowClicked}
      @clear-filter=${this._handleClearFilter}
      @value-changed=${this._handleSearchFilterChanged}
      @sorting-changed=${this._handleSortingChanged}
      @grouping-changed=${this._handleGroupingChanged}
      @collapsed-changed=${this._handleCollapseChanged}
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
                documentationUrl({ experimental: this.hacs.info?.experimental }),
                "_blank",
                "noreferrer=true",
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
                  experimental: this.hacs.info?.experimental,
                  path: "/docs/issues",
                }),
                "_blank",
                "noreferrer=true",
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

      <ha-form
        slot="filter-pane"
        class="filters"
        .hass=${this.hass}
        .data=${{
          status: this._activeFilters?.find((filter) => filter.startsWith("status_")) || "",
          type: this._activeFilters?.find((filter) => filter.startsWith("type_")) || "",
          columns: Object.entries(tableColumnDefaults)
            .filter(([key, value]) => this._tableColumns[key] ?? value)
            .map(([key, _]) => key),
        }}
        .schema=${this._filterSchema(this.hacs.localize, this.hacs.info.categories, this.narrow)}
        .computeLabel=${this._computeFilterFormLabel}
        @value-changed=${this._handleFilterChanged}
      ></ha-form>
    </hass-tabs-subpage-data-table>`;
  };

  private _filterRepositories = memoize(
    (
      repositories: RepositoryBase[],
      localizeFunc: LocalizeFunc<HacsLocalizeKeys>,
      activeFilters?: string[],
    ): RepositoryBase[] =>
      repositories
        .filter((repository) => {
          if (
            activeFilters?.filter((filter) => filter.startsWith("status_")).length &&
            !activeFilters.includes(`status_${repository.status}`)
          ) {
            return false;
          }
          if (
            activeFilters?.filter((filter) => filter.startsWith("type_")).length &&
            !activeFilters.includes(`type_${repository.category}`)
          ) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          if (a.installed !== b.installed) {
            return a.installed ? -1 : 1;
          }
          if (a.new !== b.new) {
            return a.new ? -1 : 1;
          }
          if (a.stars !== b.stars) {
            return a.stars > b.stars ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        })
        .map((repository) => ({
          ...repository,
          translated_status:
            localizeFunc(`repository_status.${repository.status}`) || repository.status,
          translated_category: localizeFunc(`common.type.${repository.category}`),
        })),
  );

  private _columns = memoize(
    (
      narrow: boolean,
      tableColumnsOptions: { [key: string]: boolean },
      localizeFunc: LocalizeFunc<HacsLocalizeKeys>,
    ): DataTableColumnContainer<RepositoryBase> => ({
      icon: {
        title: "",
        label: this.hass.localize("ui.panel.config.lovelace.dashboards.picker.headers.icon"),
        hidden: false,
        type: "icon",
        template: (repository: RepositoryBase) =>
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
                  .path=${typeIcon(repository.category)}
                ></ha-svg-icon>
              `,
      },
      name: {
        ...defaultKeyData,
        title: localizeFunc("column.name"),
        hidden: false,
        main: true,
        sortable: true,
        grows: true,
        template: (repository: RepositoryBase) => html`
          ${repository.new
            ? html`<ha-svg-icon
                label="New"
                style="color: var(--primary-color); margin-right: 4px;"
                .path=${mdiNewBox}
              ></ha-svg-icon>`
            : ""}
          ${!this._activeFilters?.includes("downloaded") && repository.installed
            ? html`<ha-svg-icon
                label="Downloaded"
                style="color: var(--primary-color); margin-right: 4px;"
                .path=${mdiDownload}
              ></ha-svg-icon>`
            : ""}
          ${repository.name}
          <div class="secondary">
            ${narrow ? localizeFunc(`common.type.${repository.category}`) : repository.description}
          </div>
        `,
      },
      downloads: {
        ...defaultKeyData,
        title: localizeFunc("column.downloads"),
        hidden: narrow || !tableColumnsOptions.downloads,
        sortable: true,
        width: "10%",
        template: (repository: RepositoryBase) => html`${repository.downloads || "-"}`,
      },
      stars: {
        ...defaultKeyData,
        title: localizeFunc("column.stars"),
        hidden: narrow || !tableColumnsOptions.stars,
        sortable: true,
        width: "10%",
      },
      last_updated: {
        ...defaultKeyData,
        title: localizeFunc("column.last_updated"),
        hidden: narrow || !tableColumnsOptions.last_updated,
        sortable: true,
        width: "15%",
        template: (repository: RepositoryBase) => {
          if (!repository.last_updated) {
            return "-";
          }
          try {
            return relativeTime(new Date(repository.last_updated), this.hass.locale);
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
        width: "10%",
        template: (repository: RepositoryBase) =>
          repository.installed ? repository.installed_version : "-",
      },
      available_version: {
        ...defaultKeyData,
        title: localizeFunc("column.available_version"),
        hidden: narrow || !tableColumnsOptions.available_version,
        sortable: true,
        width: "10%",
        template: (repository: RepositoryBase) =>
          repository.installed ? repository.available_version : "-",
      },
      translated_status: {
        ...defaultKeyData,
        title: localizeFunc("column.status"),
        hidden: narrow || !tableColumnsOptions.status,
        sortable: true,
        groupable: true,
        width: "10%",
      },
      translated_category: {
        ...defaultKeyData,
        title: localizeFunc("column.type"),
        hidden: narrow || !tableColumnsOptions.type,
        sortable: true,
        groupable: true,
        width: "10%",
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
        template: (repository: RepositoryBase) => html`
          <ha-icon-overflow-menu
            .hass=${this.hass}
            .items=${repositoryMenuItems(this, repository) as IconOverflowMenuItem[]}
            narrow
          >
          </ha-icon-overflow-menu>
        `,
      },
    }),
  );

  private _groupOrder = memoize(
    (localize: LocalizeFunc<HacsLocalizeKeys>, activeGrouping: string | undefined) =>
      activeGrouping === "translated_status"
        ? STATUS_ORDER.map((filter) =>
            localize(
              // @ts-ignore
              `repository_status.${filter}`,
            ),
          )
        : undefined,
  );

  private _filterSchema = memoize(
    (localizeFunc: LocalizeFunc<HacsLocalizeKeys>, types: string[], narrow: boolean) =>
      [
        {
          name: "filters",
          type: "constant",
          value: "",
        },
        {
          name: "status",
          selector: {
            select: {
              options: STATUS_ORDER.map((filter) => ({
                value: `status_${filter}`,
                label: localizeFunc(
                  // @ts-ignore
                  `repository_status.${filter}`,
                ),
              })),
              mode: "dropdown",
              sort: false,
            },
          },
        },
        {
          name: "type",
          selector: {
            select: {
              options: types.map((type: string) => ({
                label: localizeFunc(`common.type.${type as RepositoryType}`),
                value: `type_${type}`,
              })),
              mode: "dropdown",
              sort: true,
            },
          },
        },
        ...(narrow
          ? []
          : ([
              {
                name: "behaviour",
                type: "constant",
                value: "",
              },
              {
                name: "columns",
                selector: {
                  select: {
                    options: Object.keys(tableColumnDefaults).map((column) => ({
                      label: localizeFunc(`column.${column}` as HacsLocalizeKeys),
                      value: column,
                    })),
                    multiple: true,
                    mode: "dropdown",
                    sort: true,
                  },
                },
              },
            ] as const satisfies readonly HaFormSchema[])),
      ] as const satisfies readonly HaFormSchema[],
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

  private _computeFilterFormLabel = (schema, _) =>
    this.hacs.localize(
      // @ts-ignore
      `dialog_overview.${schema.name}`,
    ) ||
    this.hacs.localize(
      // @ts-ignore
      `dialog_overview.sections.${schema.name}`,
    ) ||
    schema.name;

  private _handleRowClicked(ev: CustomEvent) {
    navigate(`/hacs/repository/${ev.detail.id}`);
  }

  private _handleFilterChanged(ev: CustomEvent) {
    ev.stopPropagation();
    const data = ev.detail.value;
    const updatedFilters: string[] = Object.entries<any>(data)
      .filter(
        ([key, value]) =>
          ["status", "type"].includes(key) && ![undefined, null, ""].includes(value),
      )
      .map(([_, value]) => value);
    this._activeFilters = updatedFilters.length ? updatedFilters : undefined;
    this._tableColumns = Object.keys(tableColumnDefaults).reduce(
      (entries, key) => ({
        ...entries,
        [key]: data.columns.includes(key) ?? tableColumnDefaults[key],
      }),
      {},
    ) as Record<tableColumnDefaultsType, boolean>;
  }

  private _handleSearchFilterChanged(ev: CustomEvent) {
    this._activeSearch = ev.detail.value;
  }

  private _handleGroupingChanged(ev: CustomEvent) {
    this._activeGrouping = ev.detail.value;
  }

  private _handleCollapseChanged(ev: CustomEvent) {
    this._activeCollapsed = ev.detail.value;
  }

  private _handleSortingChanged(ev: CustomEvent) {
    this._activeSorting = ev.detail;
  }

  private _handleClearFilter() {
    this._activeFilters = undefined;
  }

  static get styles(): CSSResultGroup {
    return [haStyle, HacsStyles];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hacs-dashboard": HacsDashboard;
  }
}
