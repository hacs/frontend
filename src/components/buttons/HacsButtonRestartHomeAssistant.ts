import {
  customElement,
  css,
  CSSResultArray,
  TemplateResult,
  html,
  property
} from "lit-element";
import swal from "sweetalert";

import { HacsRepositoryButton } from "./HacsRepositoryButton";
import { HACS } from "../../Hacs";
import { Route } from "../../data";

@customElement("hacs-button-restart-home-assistant")
export class HacsButtonRestartHomeAssistant extends HacsRepositoryButton {
  @property() public hacs!: HACS;
  @property() public route!: Route;

  render(): TemplateResult | void {
    return html`
      <mwc-button @click=${this.RestartHomeAssistant}>
        ${this.hacs.localize("repository.restart_home_assistant")}
      </mwc-button>
    `;
  }

  static get styles(): CSSResultArray {
    return [
      css`
        mwc-button {
          --mdc-theme-primary: var(--google-red-500);
        }
      `
    ];
  }

  RestartHomeAssistant() {
    swal(this.hacs.localize("confirm.restart_home_assistant"), {
      buttons: [
        this.hacs.localize("confirm.no"),
        this.hacs.localize("confirm.yes")
      ]
    }).then(value => {
      if (value !== null) {
        this.hass.callService("homeassistant", "restart");
        swal(this.hacs.localize("confirm.home_assistant_is_restarting"));
      }
    });
  }
}
