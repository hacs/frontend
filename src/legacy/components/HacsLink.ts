import {
  CSSResult,
  LitElement,
  customElement,
  TemplateResult,
  html,
  css,
  property,
} from "lit-element";

@customElement("hacs-link")
export class HacsLink extends LitElement {
  @property({ type: Boolean }) public newtab: boolean = false;
  @property() private url!: string;
  protected render(): TemplateResult | void {
    const external = this.url.includes("http");
    if (external) {
      return html`
        <a href="${this.url}" target="_blank" rel="noreferrer">
          <slot></slot>
        </a>
      `;
    }
    if (this.newtab) {
      return html`
        <a href="${this.url}" target="_blank">
          <slot></slot>
        </a>
      `;
    }
    return html`
      <a href="${this.url}" target="_top">
        <slot></slot>
      </a>
    `;
  }

  static get styles(): CSSResult {
    return css`
      a {
        color: var(--hcv-text-color-link);
        text-decoration: var(--hcv-text-decoration-link);
      }
    `;
  }
}
