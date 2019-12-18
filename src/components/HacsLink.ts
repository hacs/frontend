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
  @property() private ext: boolean = true;
  protected render(): TemplateResult | void {
    return html`
      <a
        href="${this.url}"
        target="${this.ext ? "_blank" : "_self"}"
        rel="${this.ext ? "noreferrer" : ""}"
      >
        <slot></slot>
      </a>
    `;
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
