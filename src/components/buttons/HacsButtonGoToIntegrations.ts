import { customElement, TemplateResult, html, property } from "lit-element";

import { HacsRepositoryButton } from "./HacsRepositoryButton";
import { HACS } from "../../Hacs";
import { Route } from "../../types";

@customElement("hacs-button-goto-integrations")
export class HacsButtonGoToIntegrations extends HacsRepositoryButton {
  @property({ type: Object }) public hacs!: HACS;

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
        detail: { value: "integrations/dashboard" },
        bubbles: true,
        composed: true
      })
    );
  }
}
