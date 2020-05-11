import {
  LitElement,
  TemplateResult,
  html,
  customElement,
  property,
} from "lit-element";
import { load_lovelace } from "card-tools/src/hass";
import { HomeAssistant } from "custom-card-helpers";
import { Route } from "./legacy/data";
import "./legacy/LoadUIElements";

import "./panels/hacs-entry-panel";

@customElement("hacs-frontend")
class HacsFrontend extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;

  private _setModalCSS() {
    if (document.getElementById("modal-style")) return;
    var element = document.body;
    var style = document.createElement("style");
    style.id = "modal-style";
    style.innerHTML = `
      .swal-modal {
          background-color: var(--primary-background-color) !important;
          text-align: left;
      }
      .swal-text {
          color: var(--primary-text-color) !important;
      }
      .swal-button {
          background-color: transparent !important;
          color: var(--mdc-theme-primary, --primary-text-color) !important;
      }
      .swal-text:first-child {
        margin: 16px 0px 0px 8px;
      }
      .swal-button:focus {
        outline: none;
        box-shadow: none;
      }
      .swal-button:hover {
        outline: none;
        box-shadow: 0 0 0 1px #fff, 0 0 0 3px;
      }`;
    element.appendChild(style);
  }

  public connectedCallback() {
    super.connectedCallback();
    this._setModalCSS();
    load_lovelace();
  }

  protected render(): TemplateResult | void {
    return html`
      <hacs-entry-panel
        .hass=${this.hass}
        .route=${this.route}
        .narrow=${this.narrow}
      ></hacs-entry-panel>
    `;

    return html`
      <hacs-frontendbase
        .hass=${this.hass}
        .route=${this.route}
        .narrow=${this.narrow}
      >
      </hacs-frontendbase>
    `;
  }
}
