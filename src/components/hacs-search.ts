import {
  css,
  CSSResultArray,
  customElement,
  html,
  query,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";

import { HacsCommonStyle } from "../styles/hacs-common-style";
import { localize } from "../localize/localize";

@customElement("hacs-search")
export class HacsSearch extends LitElement {
  @property() public input: string;
  @query("#search-input") private _filterInput?: any;

  protected render(): TemplateResult | void {
    return html`
      <div class="searchbar">
        <ha-icon icon="mdi:magnify" role="button"></ha-icon>
        <input
          id="search-input"
          class="search-input"
          placeholder="${localize("search.placeholder")}"
          .value=${this.input || ""}
          @input=${this._inputValueChanged}
        />
        ${this.input
          ? html`
              <ha-icon-button
                icon="mdi:close"
                role="button"
                @click=${this._clearInput}
              ></ha-icon-button>
            `
          : ""}
      </div>
    `;
  }

  private _inputValueChanged() {
    this.input = this._filterInput?.value;
  }

  private _clearInput() {
    this.input = "";
    this.dispatchEvent(
      new CustomEvent("input", {
        bubbles: true,
        composed: true,
      })
    );
  }

  static get styles(): CSSResultArray {
    return [
      HacsCommonStyle,
      css`
        .searchbar {
          display: flex;
          align-items: center;
          font-size: 20px;
          top: 65px;
          height: 65px;
          background-color: var(--sidebar-background-color);
          border-bottom: 1px solid var(--divider-color);
          padding: 0 16px;
          box-sizing: border-box;
        }
        .search-input {
          width: calc(100% - 48px);
          height: 40px;
          border: 0;
          padding: 0 16px;
          font-size: initial;
          color: var(--sidebar-text-color);
          font-family: var(--paper-font-body1_-_font-family);
        }
        input:focus {
          outline-offset: 0;
          outline: 0;
        }
        input {
          background-color: var(--sidebar-background-color);
        }
      `,
    ];
  }
}
