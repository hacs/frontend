import {
  CSSResultArray,
  LitElement,
  customElement,
  TemplateResult,
  html,
  css,
  property,
} from "lit-element";

@customElement("hacs-fab")
export class HacsFab extends LitElement {
  @property() public icon!: string;
  @property({ type: Boolean }) public narrow!: boolean;

  protected render(): TemplateResult | void {
    return html`
      <div class="fab" ?narrow=${this.narrow}>
        <div><ha-icon .icon=${this.icon}></ha-icon></div>
      </div>
    `;
  }

  static get styles(): CSSResultArray {
    return [
      css`
        .fab {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          width: 56px;
          height: 56px;
          cursor: pointer;
          user-select: none;
          -webkit-appearance: none;
          background-color: var(--hcv-color-fab);
          -webkit-box-shadow: 2px 2px 8px 1px rgba(0, 0, 0, 0.3);
          -moz-box-shadow: 2px 2px 8px 1px rgba(0, 0, 0, 0.3);
          box-shadow: 2px 2px 8px 1px rgba(0, 0, 0, 0.3);
          border-radius: 50%;
        }
        .fab[narrow] {
          margin-bottom: 65px;
        }
        ha-icon {
          margin: auto;
          color: var(--hcv-text-color-fab);
          height: 100%;
          width: 100%;
          --mdc-icon-size: 32px;
        }
      `,
    ];
  }
}
