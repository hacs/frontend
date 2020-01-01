import { customElement, TemplateResult, html, property } from "lit-element";

import { HacsRepositoryButton } from "./HacsRepositoryButton";
import { HACS } from "../../Hacs";
import { Route } from "../../types";

@customElement("hacs-button-goto-integrations")
export class HacsButtonGoToIntegrations extends HacsRepositoryButton {
  @property({ type: Object }) public hacs!: HACS;
  @property({ type: Object }) public route!: Route;

  render(): TemplateResult | void {
    return html`
      <mwc-button @click=${this.GoToIntegrations}>
        ${this.hacs.localize("repository.goto_integrations")}
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
}
