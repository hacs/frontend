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

const Checked = "&#10004;";

@customElement("hacs-checkbox")
export class HacsCheckbox extends LitElement {
  @property({ attribute: false }) public checked: boolean;
  @property({ attribute: false }) public label: string;

  protected render(): TemplateResult | void {
    return html`
      <div class="checkbox-container">
        <div class="checkbox" checked>
          <div class="value">
            ${this.checked ? Checked : ""}
          </div>
        </div>
        <div class="label">
          ${this.label}
        </div>
      </div>
    `;
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyles,
      css`
        .checkbox-container {
          display: flex;
          color: var(--hcv-text-color-primary);
        }

        .label {
          line-height: 20px;
        }
        .value {
          margin-left: 4px;
        }

        .checkbox {
          display: none;
          height: 16px;
          width: 16px;
          font-size: 12px;
          margin: 0 8px;
          border: 1px solid var(--hcv-text-color-primary);
          background-color: var(--accent-color);
          border-radius: 6px;
          line-height: 16px;
        }
      `,
    ];
  }
}
