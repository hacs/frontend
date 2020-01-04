import { customElement, TemplateResult, html, property } from "lit-element";

import { HacsRepositoryButton } from "./HacsRepositoryButton";
import { HACS } from "../../Hacs";

@customElement("hacs-button-goto-integrations")
export class HacsButtonGoToIntegrations extends HacsRepositoryButton {
  @property() public hacs!: HACS;

  render(): TemplateResult | void {
    return html`
      <mwc-button @click=${this.GoToIntegrations}>
        ${this.hacs.localize("repository.goto_integrations")}
      </mwc-button>
    `;
  }

  GoToIntegrations() {
    this.dispatchEvent(
      new CustomEvent("hacs-location-change", {
        detail: { value: "/config/integrations/dashboard", force: true },
        bubbles: true,
        composed: true
      })
    );
  }
}
