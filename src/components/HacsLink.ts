import {
  CSSResultArray,
  LitElement,
  customElement,
  TemplateResult,
  html,
  css,
  property
} from "lit-element";

@customElement("hacs-link")
export class HacsLink extends LitElement {
  @property() private url!: string;
  protected render(): TemplateResult | void {
    if (this.url.includes("http")) {
      return html`
      <a
        href="${this.url}"
        target="_blank"
        rel="noreferrer"
      >
        <slot></slot>
      </a>
    `;
    } else {
      return html`
      <a href="${this.url}" >
        <slot></slot>
      </a>
    `;
    }
  }

  static get styles(): CSSResultArray {
    return [
      css`
        a {
          color: var(--link-text-color, var(--accent-color));
          text-decoration: none;
        }
      `
    ];
  }
}
