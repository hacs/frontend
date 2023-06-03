import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators";
import { computeRTLDirection } from "../../homeassistant-frontend/src/common/util/compute_rtl";
import { HaTabsSubpageDataTable } from "../../homeassistant-frontend/src/layouts/hass-tabs-subpage-data-table";

import "../../homeassistant-frontend/src/components/data-table/ha-data-table";

@customElement("hacs-tabs-subpage-data-table")
export class HacsTabsSubpageDataTable extends HaTabsSubpageDataTable {
  protected render(): TemplateResult {
    const hiddenLabel = this.numHidden
      ? this.hiddenLabel ||
        this.hass.localize("ui.components.data-table.hidden", "number", this.numHidden) ||
        this.numHidden
      : undefined;

    const filterInfo = this.activeFilters
      ? html`${this.hass.localize("ui.components.data-table.filtering_by")}
        ${this.activeFilters.join(", ")} ${hiddenLabel ? `(${hiddenLabel})` : ""}`
      : hiddenLabel;

    const headerToolbar = html`<search-input
      .hass=${this.hass}
      .filter=${this.filter}
      .suffix=${!this.narrow}
      @value-changed=${
        // @ts-expect-error accesing private property
        this._handleSearchChange
      }
      .label=${this.searchLabel || this.hass.localize("ui.components.data-table.search")}
    >
      ${!this.narrow
        ? html`<div
            class="filters"
            slot="suffix"
            @click=${
              // @ts-expect-error accesing private property
              this._preventDefault
            }
          >
            ${filterInfo
              ? html`<div class="active-filters">
                  ${filterInfo}
                  <mwc-button
                    @click=${
                      // @ts-expect-error accesing private property
                      this._clearFilter
                    }
                  >
                    ${this.hass.localize("ui.components.data-table.clear")}
                  </mwc-button>
                </div>`
              : ""}
            <slot name="filter-menu"></slot>
          </div>`
        : ""}
    </search-input>`;

    return html`
      <hass-tabs-subpage
        .hass=${this.hass}
        .localizeFunc=${this.localizeFunc}
        .narrow=${this.narrow}
        .isWide=${this.isWide}
        .backPath=${this.backPath}
        .backCallback=${this.backCallback}
        .route=${this.route}
        .tabs=${this.tabs}
        .mainPage=${this.mainPage}
        .supervisor=${this.supervisor}
      >
        ${!this.hideFilterMenu
          ? html`
              <div slot="toolbar-icon">
                ${this.narrow
                  ? html`
                      <div class="filter-menu">
                        ${this.numHidden || this.activeFilters
                          ? html`<span class="badge">${this.numHidden || "!"}</span>`
                          : ""}
                        <slot name="filter-menu"></slot>
                      </div>
                    `
                  : ""}<slot name="toolbar-icon"></slot>
              </div>
            `
          : ""}
        ${this.narrow
          ? html`
              <div slot="header">
                <slot name="header">
                  <div class="search-toolbar">${headerToolbar}</div>
                </slot>
              </div>
            `
          : ""}
        <ha-data-table
          .hass=${this.hass}
          .columns=${this.columns}
          .data=${this.data}
          .filter=${this.filter}
          .selectable=${this.selectable}
          .hasFab=${this.hasFab}
          .id=${this.id}
          .noDataText=${this.noDataText}
          .dir=${computeRTLDirection(this.hass)}
          .clickable=${this.clickable}
          .appendRow=${this.appendRow}
        >
          ${!this.narrow
            ? html`
                <div slot="header">
                  <slot name="header">
                    <div class="table-header">${headerToolbar}</div>
                  </slot>
                </div>
              `
            : html` <div slot="header"></div> `}
        </ha-data-table>
        <div slot="fab"><slot name="fab"></slot></div>
      </hass-tabs-subpage>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      super.styles,
      css`
        ha-data-table {
          width: 100%;
          height: 100%;
          --data-table-border-width: 0;
        }
        :host(:not([narrow])) ha-data-table {
          height: calc(100vh - 1px - var(--header-height));
          display: block;
        }
      `,
    ];
  }
}
