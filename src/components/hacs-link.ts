import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { mainWindow } from "../../homeassistant-frontend/src/common/dom/get_main_window";
import { navigate } from "../../homeassistant-frontend/src/common/navigate";

@customElement("hacs-link")
export class HacsLink extends LitElement {
  @property({ type: Boolean }) public newtab = false;

  @property({ type: Boolean }) public parent = false;

  @property() public title = "";

  @property() public url!: string;

  protected render(): TemplateResult | void {
    return html`<span title=${this.title || this.url} @click=${this._open}><slot></slot></span>`;
  }

  private _open(): void {
    if (this.url.startsWith("/") && !this.newtab) {
      navigate(this.url, { replace: true });
      return;
    }
    const external = this.url?.startsWith("http");
    let features = "";
    let target = "_blank";

    if (external) {
      features = "noreferrer=true";
    }

    if (!external && !this.newtab) {
      target = "_blank";
    }

    if (!external && !this.parent) {
      target = "_parent";
    }

    mainWindow.open(this.url, target, features);
  }

  static get styles(): CSSResultGroup {
    return css`
      span {
        cursor: pointer;
        color: var(--hcv-text-color-link);
        text-decoration: var(--hcv-text-decoration-link);
      }
    `;
  }
}
