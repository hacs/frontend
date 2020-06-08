import {
  css,
  CSSResultArray,
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";

import { HacsStyles } from "../styles/hacs-common-style";
import { Filter } from "../data/common";
import { localize } from "../localize/localize";
import "./hacs-checkbox";

@customElement("hacs-filter")
export class HacsFilter extends LitElement {
  @property({ attribute: false }) public filters: Filter[];

  protected async firstUpdated() {
    this.addEventListener("checkbox-change", (e) => this._filterClick(e));
  }

  protected render(): TemplateResult | void {
    return html`
      <div class="filter">
        ${this.filters?.map(
          (filter) => html`
            <hacs-checkbox
              class="checkbox"
              .label=${localize(`common.${filter.id}`) || filter.value}
              .id=${filter.id}
              .checked=${filter.checked || false}
            />
            </hacs-checkbox>`
        )}
      </div>
    `;
  }

  private _filterClick(ev): void {
    const filter = ev.detail;
    this.dispatchEvent(
      new CustomEvent("filter-change", {
        detail: {
          id: filter.id,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyles,
      css`
        .filter {
          display: flex;
          border-bottom: 1px solid var(--divider-color);
          align-items: center;
          font-size: 16px;
          height: 32px;
          line-height: 4px;
          background-color: var(--sidebar-background-color);
          padding: 0 16px;
          box-sizing: border-box;
        }

        .checkbox:not(:first-child) {
          margin-left: 20px;
        }
      `,
    ];
  }
}
