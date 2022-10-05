import "@material/mwc-button/mwc-button";
import "@material/mwc-list/mwc-list";
import "@material/mwc-list/mwc-list-item";
import {
  mdiAlertCircleOutline,
  mdiDotsVertical,
  mdiFileDocument,
  mdiGit,
  mdiGithub,
  mdiInformation,
  mdiPlaylistEdit,
  mdiPlus,
} from "@mdi/js";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
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

  @LocalStorage("hacs-table-columns", true, false)
  private _tableColumns: TableColumnsOptions = {
    entry: {
      name: true,
      category: true,
      downloads: false,
      stars: false,
    },
    explore: {
      name: true,
      category: true,
      downloads: true,
      stars: true,
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
    .data=${this._filterRepositories(this.hacs.repositories, this.section === "entry")}
    .hass=${this.hass}
    isWide=${this.isWide}
    .localizeFunc=${this.hass.localize}
    .mainPage=${this.section === "entry"}
    .narrow=${this.narrow}
    .route=${this.route}
    clickable
    .hasFab=${this.section === "entry"}
    .noDataText=${this.section === "entry"
      ? "No downloaded repositories"
      : "No repositories matching search"}
    @row-click=${this._handleRowClicked}
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
      <mwc-list-item graphic="icon" @click=${(ev) => ev.preventDefault()}>
        <ha-svg-icon slot="graphic" .path=${mdiPlaylistEdit}></ha-svg-icon>
        Edit columns
      </mwc-list-item>
      <mwc-list-item graphic="icon">
        <ha-svg-icon slot="graphic" .path=${mdiInformation}></ha-svg-icon>
        ${this.hacs.localize("menu.about")}
      </mwc-list-item>
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
    (repositories: RepositoryBase[], downloaded: boolean): DataTableRowData[] =>
      repositories.filter(
        (reposiotry) =>
          (!downloaded && !reposiotry.installed) || (downloaded && reposiotry.installed)
      )
  );

  private _columns = memoize(
    (
      narrow: boolean,
      tableColumnsOptions: TableColumnsOptions
    ): DataTableColumnContainer<RepositoryBase> => ({
      id: {
        title: "ID",
        hidden: true,
        sortable: true,
        filterable: true,
      },
      name: {
        title: "Name",
        main: true,
        sortable: true,
        filterable: true,
        direction: narrow || tableColumnsOptions[this.section].stars ? undefined : "asc",
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
        direction: "desc",
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
        title: "Authros",
        hidden: true,
        sortable: true,
        filterable: true,
      },
      topics: {
        title: "Topics",
        hidden: true,
        sortable: true,
        filterable: true,
      },
      full_name: {
        title: "Full name",
        hidden: true,
        sortable: true,
        filterable: true,
      },
    })
  );

  private _handleRowClicked(ev: CustomEvent) {
    navigate(`/hacs/repository/${ev.detail.id}`);
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
        // Nothing
        break;
      case 5:
        showDialogAbout(this, this.hacs);
        break;
    }
  }

  static get styles(): CSSResultGroup {
    return [haStyle, HacsStyles, css``];
  }
}
