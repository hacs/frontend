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

@customElement("hacs-checkbox")
export class HacsCheckbox extends LitElement {
  @property({ attribute: false }) public checked: boolean;
  @property({ attribute: false }) public label: string;
  @property({ attribute: false }) public id: string;

  protected render(): TemplateResult | void {
    return html`
      <div class="checkbox-container">
        <div class="checkbox" @click=${this._checkboxClicked}>
          <div class="value">${this.checked ? "✔" : ""}</div>
        </div>
        <div class="label">
          ${this.label}
        </div>
      </div>
    `;
  }

  private _checkboxClicked() {
    this.checked = !this.checked;
    this.dispatchEvent(
      new CustomEvent("checkbox-change", {
        detail: {
          id: this.id,
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
        .checkbox-container {
          display: flex;
          color: var(--hcv-text-color-primary);
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .label {
          line-height: 18px;
          opacity: var(--dark-primary-opacity);
          font-family: var(--paper-font-subhead_-_font-family);
          -webkit-font-smoothing: var(--paper-font-subhead_-_-webkit-font-smoothing);
          font-size: var(--paper-font-subhead_-_font-size);
        }
        .value {
          margin: 1px 0 0 2px;
          color: var(--hcv-text-color-on-background);
        }

        .checkbox {
          cursor: pointer;
          height: 16px;
          width: 16px;
          font-size: 14px;
          margin: 0 8px;
          background-color: var(--accent-color);
          border-radius: 6px;
          line-height: 16px;
        }
      `,
    ];
  }
}
