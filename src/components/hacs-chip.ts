import {
  CSSResultArray,
  LitElement,
  customElement,
  TemplateResult,
  html,
  css,
  property,
} from "lit-element";

@customElement("hacs-chip")
export class HacsChip extends LitElement {
  @property() public icon!: string;
  @property() public value!: any;

  protected render(): TemplateResult | void {
    return html`
      <div class="chip">
        <div class="icon"><ha-icon .icon=${this.icon}></ha-icon></div>
        <div class="value">${String(this.value) || ""}</div>
      </div>
    `;
  }

  static get styles(): CSSResultArray {
    return [
      css`
        .chip {
          background-color: var(
            --hacs-chip-background-color,
            var(--accent-color)
          );
          height: 24px;
          color: var(--hacs-chip-text-color, var(--text-primary-color));
          max-width: fit-content;
          display: flex;
          border-radius: 50px;
          padding: 0 4px;
          box-shadow: 2px 2px 8px 1px rgba(0, 0, 0, 0.3);
        }
        .icon {
          margin: auto;
          color: var(--hacs-chip-background-color, var(--accent-color));
          height: 22px;
          width: 22px;
          line-height: 22px;
          text-align: center;

          margin-left: -3px;
          background-color: var(
            --hacs-chip-text-color,
            var(--text-primary-color)
          );
          border-radius: 50px;
        }
        .value {
          width: max-content;
          margin: auto;
          margin-left: 5px;
          margin-right: 5px;
        }
        ha-icon {
          --mdc-icon-size: 18px;
        }
      `,
    ];
  }
}
