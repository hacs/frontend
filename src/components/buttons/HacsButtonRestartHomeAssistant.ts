import { customElement, TemplateResult, html, property } from "lit-element";
import swal from "sweetalert";
import { HomeAssistant } from "custom-card-helpers";

import { HacsRepositoryButton } from "./HacsRepositoryButton";
import { HACS } from "../../Hacs";
import { localize } from "../../localize/localize";

@customElement("hacs-button-restart-home-assistant")
export class HacsButtonRestartHomeAssistant extends HacsRepositoryButton {
  @property({ type: Object }) public hacs!: HACS;
  @property({ type: Object }) public hass!: HomeAssistant;

  render(): TemplateResult | void {
    if (!this.repository.installed) return html``;

    return html`
      <mwc-button @click=${this.RestartHomeAssistant}>
        ${this.hacs.localize("repository.restart_home_assistant")}
      </mwc-button>
    `;
  }

  RestartHomeAssistant() {
    swal(localize("confirm.restart_home_assistant"), {
      buttons: [localize("confirm.no"), localize("confirm.yes")]
    }).then(value => {
      if (value !== null) {
        this.hass.callService("homeassistant", "restart");
        swal(localize("confirm.home_assistant_is_restarting"));
      }
    });
  }
}
