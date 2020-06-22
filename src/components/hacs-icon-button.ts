import "@material/mwc-icon-button";
import {
  customElement,
  html,
  TemplateResult,
  property,
  LitElement,
  CSSResult,
  css,
} from "lit-element";
import "../../homeassistant-frontend/src/components/ha-svg-icon";

@customElement("hacs-icon-button")
export class HacsIconButton extends LitElement {
  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: String }) icon = "";

  protected createRenderRoot() {
    return this.attachShadow({ mode: "open", delegatesFocus: true });
  }

  protected render(): TemplateResult {
    return html`
      <mwc-icon-button .disabled=${this.disabled}>
        <ha-svg-icon .path=${this.icon}></ha-svg-icon>
      </mwc-icon-button>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: inline-block;
        outline: none;
      }
      :host([disabled]) {
        pointer-events: none;
      }
      mwc-icon-button {
        --mdc-theme-on-primary: currentColor;
        --mdc-theme-text-disabled-on-light: var(--disabled-text-color);
      }
      ha-svg-icon {
        --ha-icon-display: inline;
      }
    `;
  }
}
