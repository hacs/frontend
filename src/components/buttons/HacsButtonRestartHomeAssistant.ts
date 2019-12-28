import { customElement, TemplateResult, html, property } from "lit-element";
import swal from "sweetalert";

import { HacsRepositoryButton } from "./HacsRepositoryButton";
import { HACS } from "../../Hacs";
import { Route } from "../../types";
import { localize } from "../../localize/localize";

@customElement("hacs-button-restart-home-assistant")
export class HacsButtonRestartHomeAssistant extends HacsRepositoryButton {
  @property({ type: Object }) public hacs!: HACS;
  @property({ type: Object }) public route!: Route;

  render(): TemplateResult | void {
    if (!this.repository.installed) return html``;

    return html`
      <mwc-button @click=${this.RestartHomeAssistant}>
        ${this.hacs.localize("repository.restart_home_assistant")}
      </mwc-button>
    `;
  }

  GoToIntegrations() {
    this.route.prefix = `/config`;
    this.route.path = `/integrations/dashboard`;
    this.dispatchEvent(
      new CustomEvent("hacs-location-change", {
        detail: { value: this.route, force: true },
        bubbles: true,
        composed: true
      })
    );
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
