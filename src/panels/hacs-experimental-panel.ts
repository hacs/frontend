import "@material/mwc-button/mwc-button";
import "@material/mwc-list/mwc-list";
import { mdiAlertCircle, mdiDotsVertical, mdiPlus } from "@mdi/js";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { isComponentLoaded } from "../../homeassistant-frontend/src/common/config/is_component_loaded";
import { computeRTLDirection } from "../../homeassistant-frontend/src/common/util/compute_rtl";
import "../../homeassistant-frontend/src/components/ha-alert";
import "../../homeassistant-frontend/src/components/ha-card";
import "../../homeassistant-frontend/src/components/ha-clickable-list-item";
import "../../homeassistant-frontend/src/components/ha-icon-next";
import "../../homeassistant-frontend/src/components/ha-menu-button";
import "../../homeassistant-frontend/src/components/ha-svg-icon";
import "../../homeassistant-frontend/src/layouts/ha-app-layout";
import "../../homeassistant-frontend/src/panels/config/ha-config-section";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import memoize from "memoize-one";
import { Message } from "../data/common";
import { Hacs } from "../data/hacs";
import { RepositoryBase, RepositoryInfo } from "../data/repository";
import { HacsStyles } from "../styles/hacs-common-style";
import { getMessages } from "../tools/get-messages";
import "../../homeassistant-frontend/src/components/search-input";
import "../../homeassistant-frontend/src/components/data-table/ha-data-table";
import "../../homeassistant-frontend/src/layouts/hass-subpage";
import "../../homeassistant-frontend/src/components/ha-fab";
import {
  DataTableColumnContainer,
  DataTableRowData,
} from "../../homeassistant-frontend/src/components/data-table/ha-data-table";
import { hacsIcon } from "../components/hacs-icon";
import "../../homeassistant-frontend/src/layouts/hass-tabs-subpage-data-table";
import "../../homeassistant-frontend/src/components/ha-button-menu";
import "@material/mwc-list/mwc-list-item";

@customElement("hacs-experimental-panel")
export class HacsExperimentalPanel extends LitElement {
  @property({ attribute: false }) public hacs!: Hacs;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public route!: Route;

  @property({ type: Boolean, reflect: true })
  public narrow!: boolean;

  @property({ type: Boolean }) public isWide!: boolean;

  protected render(): TemplateResult | void {
    const data = this.hacs.repositories.filter((repo) => repo.installed);

    return html`<hass-tabs-subpage-data-table
      .tabs=${[
        {
          name: "Home Assistant Community Store - EXPERIMENTAL",
          path: `/hacs/entry`,
          iconPath: hacsIcon,
        },
      ]}
      .columns=${this._columns(this.narrow)}
      .data=${this._installedRepositories(this.hacs.repositories)}
      .hass=${this.hass}
      .isWide=${this.isWide}
      .localizeFunc=${this.hass.localize}
      .mainPage=${true}
      .narrow=${this.narrow}
      .route=${this.route}
      clickable
      hasFab
      id="id"
      noDataText="No downloaded repositories"
      supervisor
      hideFilterMenu
    >
      <ha-button-menu corner="BOTTOM_START" slot="toolbar-icon" @action=${this._handleAction}>
        <ha-icon-button
          .label=${this.hass?.localize("ui.common.menu")}
          .path=${mdiDotsVertical}
          slot="trigger"
        ></ha-icon-button>
        <mwc-list-item> ${this.hacs.localize("common.reload")} </mwc-list-item>
      </ha-button-menu>
      <ha-fab
        slot="fab"
        .label=${this.hacs.localize("store.explore")}
        .extended=${!this.narrow}
        @click=${this._addRepository}
      >
        <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
      </ha-fab>
    </hass-tabs-subpage-data-table>`;
  }

  private _installedRepositories = memoize((repositories: RepositoryBase[]): DataTableRowData[] =>
    repositories.filter((repository) => repository.installed)
  );

  private _columns = memoize(
    (narrow): DataTableColumnContainer<RepositoryBase> => ({
      name: {
        main: true,
        title: "Name",
        sortable: true,
        filterable: true,
        direction: "asc",
        grows: true,
        template: narrow
          ? (name, repository: RepositoryBase) =>
              html`
                ${name}<br />
                <div class="secondary">${repository.description}</div>
              `
          : undefined,
      },
      category: {
        title: "Category",
        filterable: true,
        sortable: true,
      },
    })
  );

  static get styles(): CSSResultGroup {
    return [haStyle, HacsStyles, css``];
  }
}
