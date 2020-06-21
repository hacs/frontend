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
    return html`<div @tap=${this._open} class="link"><slot></slot></div>`;
  }

  private _open(): void {
    const external = this.url?.includes("http");
    let features = "";
    let target = "_blank";

    if (external) {
      features = "noreferrer=true";
    }
    if (!external && !this.newtab) {
      target = "_top";
    }

    console.log(this.url, target, features);
    window.open(this.url, target, features);
  }

  static get styles(): CSSResult {
    return css`
      .link {
        cursor: pointer;
        color: var(--hcv-text-color-link);
        text-decoration: var(--hcv-text-decoration-link);
      }
    `;
  }
}
