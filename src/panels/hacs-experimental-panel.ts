import "@material/mwc-button/mwc-button";
import "@material/mwc-list/mwc-list";
import "@material/mwc-list/mwc-list-item";
import {
  mdiAlertCircleOutline,
  mdiDotsVertical,
  mdiFileDocument,
  mdiFilterVariant,
  mdiGit,
  mdiGithub,
  mdiInformation,
  mdiPlus,
} from "@mdi/js";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoize from "memoize-one";
import { LocalStorage } from "../../homeassistant-frontend/src/common/decorators/local-storage";
import { navigate } from "../../homeassistant-frontend/src/common/navigate";
import type {
  DataTableColumnContainer,
  DataTableRowData,
} from "../../homeassistant-frontend/src/components/data-table/ha-data-table";

import "../../homeassistant-frontend/src/components/ha-button-menu";
import "../../homeassistant-frontend/src/components/ha-fab";
import "../../homeassistant-frontend/src/components/ha-menu-button";
import "../../homeassistant-frontend/src/components/ha-svg-icon";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import type { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { hacsIcon } from "../components/hacs-icon";
import "../components/hacs-tabs-subpage-data-table";
import type { Hacs } from "../data/hacs";
import type { RepositoryBase } from "../data/repository";
import { HacsStyles } from "../styles/hacs-common-style";
import "../../homeassistant-frontend/src/components/ha-chip";
import { mainWindow } from "../../homeassistant-frontend/src/common/dom/get_main_window";
import { showDialogAbout } from "../components/dialogs/hacs-about-dialog";
import "../../homeassistant-frontend/src/components/ha-check-list-item";

interface TableColumnsOptions {
  entry: { [key: string]: boolean };
  explore: { [key: string]: boolean };
}

@customElement("hacs-experimental-panel")
export class HacsExperimentalPanel extends LitElement {
  @property({ attribute: false }) public hacs!: Hacs;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public route!: Route;

  @property({ type: Boolean, reflect: true })
  public narrow!: boolean;

  @property({ type: Boolean }) public isWide!: boolean;

  @property({ attribute: false }) public section!: string;

  @state() activeFilters?: string[];

  @LocalStorage("hacs-table-columns", true, false)
  private _tableColumns: TableColumnsOptions = {
    entry: {
      name: true,
      downloads: false,
      stars: false,
      category: true,
    },
    explore: {
      name: true,
      downloads: false,
      stars: false,
      category: true,
    },
  };

  protected render = (): TemplateResult | void => html`<hacs-tabs-subpage-data-table
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
    .columns=${this._columns(this.narrow, this._tableColumns)}
    .data=${this._filterRepositories(
      this.hacs.repositories,
      this.section === "entry",
      this.activeFilters
    )}
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
    <ha-button-menu corner="BOTTOM_START" slot="toolbar-icon" @action=${this._handleMenuAction}>
      <ha-icon-button
        .label=${this.hass?.localize("ui.common.menu")}
        .path=${mdiDotsVertical}
        slot="trigger"
      >
      </ha-icon-button>
      <mwc-list-item graphic="icon">
        <ha-svg-icon slot="graphic" .path=${mdiFileDocument}></ha-svg-icon>
        ${this.hacs.localize("menu.documentation")}
      </mwc-list-item>
      <mwc-list-item graphic="icon">
        <ha-svg-icon slot="graphic" .path=${mdiGithub}></ha-svg-icon>
        GitHub
      </mwc-list-item>
      <mwc-list-item graphic="icon">
        <ha-svg-icon slot="graphic" .path=${mdiAlertCircleOutline}></ha-svg-icon>
        ${this.hacs.localize("menu.open_issue")}
      </mwc-list-item>
      <mwc-list-item graphic="icon" ?disabled=${Boolean(this.hacs.info.disabled_reason)}>
        <ha-svg-icon slot="graphic" .path=${mdiGit}></ha-svg-icon>
        ${this.hacs.localize("menu.custom_repositories")}
      </mwc-list-item>
      <mwc-list-item graphic="icon">
        <ha-svg-icon slot="graphic" .path=${mdiInformation}></ha-svg-icon>
        ${this.hacs.localize("menu.about")}
      </mwc-list-item>
    </ha-button-menu>

    <ha-button-menu slot="filter-menu" corner="BOTTOM_START" multi>
      <ha-icon-button
        slot="trigger"
        .label=${this.hass!.localize("ui.panel.config.entities.picker.filter.filter")}
        .path=${mdiFilterVariant}
      >
      </ha-icon-button>
      <p class="menu_header">Hide categories</p>
      ${this.narrow && this.activeFilters?.length
        ? html`<mwc-list-item @click=${this._handleClearFilter}>
            >${this.hass.localize("ui.components.data-table.filtering_by")}
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
      <div class="divider"></div>

      <p class="menu_header">columns</p>
      ${Object.keys(this._tableColumns[this.section]).map(
        (entry) => html`
          <ha-check-list-item
            @request-selected=${this._handleColumnChange}
            graphic="control"
            .column=${entry}
            .selected=${this._tableColumns[this.section][entry]}
            left
          >
            ${this.hacs.localize(`column.${entry}`)}
          </ha-check-list-item>
        `
      )}
    </ha-button-menu>

    ${this.section === "entry"
      ? html`
          <a href="/hacs/explore" slot="fab">
            <ha-fab .label=${this.hacs.localize("store.explore")} .extended=${!this.narrow}>
              <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon> </ha-fab
          ></a>
        `
      : ""}
  </hacs-tabs-subpage-data-table>`;

  private _filterRepositories = memoize(
    (
      repositories: RepositoryBase[],
      downloaded: boolean,
      activeFilters?: string[]
    ): DataTableRowData[] =>
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
      tableColumnsOptions: TableColumnsOptions
    ): DataTableColumnContainer<RepositoryBase> => ({
      name: {
        title: "Name",
        main: true,
        sortable: true,
        filterable: true,
        hidden: !tableColumnsOptions[this.section].name,
        grows: true,
        template: !narrow
          ? (name, repository: RepositoryBase) =>
              html`
                ${name}<br />
                <div class="secondary">${repository.description}</div>
              `
          : undefined,
      },
      downloads: {
        title: "Downloads",
        hidden: narrow || !tableColumnsOptions[this.section].downloads,
        sortable: true,
        filterable: true,
        width: "10%",
        template: (downloads: number, _: RepositoryBase) => html`${downloads || "-"}`,
      },
      stars: {
        title: "Stars",
        hidden: narrow || !tableColumnsOptions[this.section].stars,
        sortable: true,
        filterable: true,
        width: "10%",
      },
      category: {
        title: "Category",
        hidden: narrow || !tableColumnsOptions[this.section].category,
        sortable: true,
        filterable: true,
        width: "10%",
      },
      authors: {
        title: "",
        hidden: true,
        filterable: true,
      },
      topics: {
        title: "",
        hidden: true,
        filterable: true,
      },
      full_name: {
        title: "",
        hidden: true,
        filterable: true,
      },
      id: {
        title: "",
        hidden: true,
        filterable: true,
      },
      description: {
        title: "",
        hidden: true,
        filterable: true,
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
    const currentSection = this._tableColumns[this.section];

    this._tableColumns = {
      ...this._tableColumns,
      [this.section]: {
        ...currentSection,
        [(ev.currentTarget as any).column]: ev.detail.selected,
      },
    };
  }

  private _handleClearFilter() {
    this.activeFilters = undefined;
  }

  private _handleMenuAction(ev: CustomEvent) {
    switch (ev.detail.index) {
      case 0:
        mainWindow.open("https://hacs.xyz/", "_blank", "noreferrer=true");
        break;
      case 1:
        mainWindow.open("https://github.com/hacs", "_blank", "noreferrer=true");
        break;
      case 2:
        mainWindow.open("https://hacs.xyz/docs/issues", "_blank", "noreferrer=true");
        break;
      case 3:
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
        break;
      case 4:
        showDialogAbout(this, this.hacs);
        break;
    }
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
