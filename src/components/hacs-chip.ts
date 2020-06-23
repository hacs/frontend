import {
  CSSResultArray,
  LitElement,
  customElement,
  TemplateResult,
  html,
  css,
  property,
} from "lit-element";

import "../../homeassistant-frontend/src/components/ha-svg-icon";

@customElement("hacs-chip")
export class HacsChip extends LitElement {
  @property() public icon!: string;
  @property() public value!: any;

  protected render(): TemplateResult | void {
    return html`
      <div class="chip">
        <div class="icon"><ha-svg-icon .path=${this.icon}></ha-svg-icon></div>
        <div class="value">${String(this.value) || ""}</div>
      </div>
    `;
  }

  static get styles(): CSSResultArray {
    return [
      css`
        .chip {
          background-color: var(--hcv-color-chip);
          height: 24px;
          color: var(--hcv-text-color-chip);
          max-width: fit-content;
          display: flex;
          border-radius: 50px;
          padding: 0 4px;
          box-shadow: 2px 2px 8px 1px rgba(0, 0, 0, 0.3);
        }
        .icon {
          margin: auto;
          color: var(--hcv-color-chip);
          height: 20px;
          width: 20px;
          line-height: 20px;
          text-align: center;

          margin-left: -2px;
          background-color: var(--hcv-text-color-chip);
          border-radius: 50px;
        }
        .value {
          width: max-content;
          margin: auto;
          margin-left: 5px;
          margin-right: 5px;
        }
        ha-svg-icon {
          --mdc-icon-size: 16px;
        }
      `,
    ];
  }
}
