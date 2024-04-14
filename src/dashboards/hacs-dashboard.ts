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
import type { CSSResultGroup, PropertyValues, TemplateResult } from "lit";
import { LitElement, html, nothing } from "lit";
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
import type { RepositoryBase } from "../data/repository";
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

const BASE_FILTER_OPTIONS = ["downloaded", "new"];

const FILTER_SCHEMA = memoize(
  (localizeFunc: LocalizeFunc<HacsLocalizeKeys>, categories: string[], narrow: boolean) =>
    [
      {
        name: "filters",
        type: "constant",
        value: "",
      },
      {
        name: "base",
        selector: {
          select: {
            options: BASE_FILTER_OPTIONS.map((filter) => ({
              value: filter,
              label: localizeFunc(
                // @ts-ignore
                `common.${filter}`,
              ),
            })),
            mode: "dropdown",
            sort: true,
          },
        },
      },
      {
        name: "category",
        selector: {
          select: {
            options: categories.map((category) => ({
              label: localizeFunc(
                // @ts-ignore
                `common.${category}`,
              ),
              value: `category_${category}`,
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
                    label: localizeFunc(
                      // @ts-ignore
                      `column.${column}`,
                    ),
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
      const updatedFilters = this.activeFilters?.filter((filter) => filter !== "downloaded") || [];
      this.activeFilters = updatedFilters.length ? updatedFilters : undefined;
    }
  }

  protected render = (): TemplateResult | void => {
    const showFab =
      !this._hide_browse_fab &&
      !this._activeSearch?.length &&
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
      ?iswide=${this.isWide}
      .localizeFunc=${this.hass.localize}
      .mainPage=${true}
      .narrow=${this.narrow}
      .route=${this.route}
      clickable
      .filter=${this._activeSearch || ""}
      hasFilters
      .filters=${this.activeFilters?.length}
      .noDataText=${this.activeFilters?.includes("downloaded")
        ? "No downloaded repositories"
        : "No repositories matching search and filters"}
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
          base: this.activeFilters?.find((filter) => BASE_FILTER_OPTIONS.includes(filter)) || "",
          category: this.activeFilters?.find((filter) => filter.startsWith("category_")) || "",
          columns: Object.entries(tableColumnDefaults)
            .filter(([key, value]) => this._tableColumns[key] ?? value)
            .map(([key, _]) => key),
        }}
        .schema=${FILTER_SCHEMA(this.hacs.localize, this.hacs.info.categories, this.narrow)}
        .computeLabel=${this._computeFilterFormLabel}
        @value-changed=${this._handleFilterChanged}
      ></ha-form>
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
            experimental: this.hacs.info?.experimental,
            path: "/docs/basic/dashboard",
          }),
          "_blank",
          "noreferrer=true",
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
        .sort((a, b) => (!a.new && b.new ? 1 : -1)),
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
        hidden: this.narrow,
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
        template: (repository: RepositoryBase) => html`
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
          ${repository.name}
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
        template: (repository: RepositoryBase) => html`${repository.downloads || "-"}`,
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
        direction:
          this.activeSort?.column === "installed_version" ? this.activeSort.direction : null,
        width: "10%",
        template: (repository: RepositoryBase) =>
          repository.installed ? repository.installed_version : "-",
      },
      available_version: {
        ...defaultKeyData,
        title: localizeFunc("column.available_version"),
        hidden: narrow || !tableColumnsOptions.available_version,
        sortable: true,
        direction:
          this.activeSort?.column === "available_version" ? this.activeSort.direction : null,
        width: "10%",
        template: (repository: RepositoryBase) =>
          repository.installed ? repository.available_version : "-",
      },
      status: {
        ...defaultKeyData,
        title: localizeFunc("column.status"),
        hidden: narrow || !tableColumnsOptions.status,
        sortable: true,
        direction: this.activeSort?.column === "status" ? this.activeSort.direction : null,
        width: "10%",
        template: (repository: RepositoryBase) =>
          ["pending-restart", "pending-upgrade"].includes(repository.status)
            ? localizeFunc(
                `repository_status.${repository.status as "pending-restart" | "pending-upgrade"}`,
              )
            : "-",
      },
      category: {
        ...defaultKeyData,
        title: localizeFunc("column.category"),
        hidden: narrow || !tableColumnsOptions.category,
        sortable: true,
        direction: this.activeSort?.column === "category" ? this.activeSort.direction : null,
        width: "10%",
        template: (repository: RepositoryBase) => localizeFunc(`common.${repository.category}`),
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
    this._tableScroll = this._scrollerTarget?.scrollTop || 0;
    navigate(`/hacs/repository/${ev.detail.id}`);
  }

  private _handleFilterChanged(ev: CustomEvent) {
    ev.stopPropagation();
    const data = ev.detail.value;
    console.log(data);
    const updatedFilters: string[] = Object.entries<any>(data)
      .filter(
        ([key, value]) =>
          ["base", "category"].includes(key) && ![undefined, null, ""].includes(value),
      )
      .map(([_, value]) => value);
    this.activeFilters = updatedFilters.length ? updatedFilters : undefined;
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

  private _handleSortingChanged(ev: CustomEvent) {
    this.activeSort = ev.detail;
  }

  private _handleClearFilter() {
    this.activeFilters = undefined;
  }

  static get styles(): CSSResultGroup {
    return [haStyle, HacsStyles];
  }
}
