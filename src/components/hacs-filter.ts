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

@customElement("hacs-filter")
export class HacsFilter extends LitElement {
  @property({ attribute: false }) public filters: Filter[];

  protected render(): TemplateResult | void {
    return html`
      <div class="filter">
        ${this.filters?.map(
          (filter) => html` <div>
            <input
              class="checkbox"
              type="checkbox"
              @change=${this._filterClick}
              .id=${filter.id}
              .name=${filter.id}
              ?checked=${filter.checked || false}
            />
            <label for="scales">${localize(`common.${filter.id}`) || filter.value}</label>
          </div>`
        )}
      </div>
    `;
  }

  private _filterClick(ev): void {
    const filter = ev.currentTarget;
    this.dispatchEvent(
      new CustomEvent("filter-change", {
        detail: {
          id: filter.id,
          checked: filter.checked,
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
          background-color: var(--sidebar-background-color);
          padding: 0 16px;
          box-sizing: border-box;
        }
        .checkbox {
          margin-left: 12px;
        }
      `,
    ];
  }
}
