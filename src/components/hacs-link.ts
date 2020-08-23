import {
  CSSResult,
  LitElement,
  customElement,
  TemplateResult,
  html,
  css,
  property,
} from "lit-element";

import { navigate } from "../../homeassistant-frontend/src/common/navigate";

@customElement("hacs-link")
export class HacsLink extends LitElement {
  @property({ type: Boolean }) public newtab: boolean = false;
  @property({ type: Boolean }) public parent: boolean = false;
  @property() private url!: string;
  @property() private title?: string;
  protected render(): TemplateResult | void {
    return html`<slot title=${this.title || this.url} @tap=${this._open}></slot>`;
  }

  private _open(): void {
    if (this.url.startsWith("/")) {
      navigate(this, this.url, true);
      return;
    }
    const external = this.url?.includes("http");
    let features = "";
    let target = "_blank";

    if (external) {
      features = "noreferrer=true";
    }

    if (!external && !this.newtab) {
      target = "_top";
    }

    if (!external && !this.parent) {
      target = "_parent";
    }

    window.open(this.url, target, features);
  }

  static get styles(): CSSResult {
    return css`
      slot {
        cursor: pointer;
        color: var(--hcv-text-color-link);
        text-decoration: var(--hcv-text-decoration-link);
      }
    `;
  }
}
