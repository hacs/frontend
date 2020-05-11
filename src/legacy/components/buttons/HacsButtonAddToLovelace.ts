import { customElement, TemplateResult, html, property } from "lit-element";
import swal from "sweetalert";
import { HacsRepositoryButton } from "./HacsRepositoryButton";

import { localize } from "../../../localize/localize";

import { Logger } from "../../misc/Logger";

@customElement("hacs-button-add-to-lovelace")
export class HacsButtonAddToLovelace extends HacsRepositoryButton {
  logger = new Logger("add_to_lovelace");
  render(): TemplateResult | void {
    if (!this.repository.installed) return html``;

    return html`
      <mwc-button @click=${this.RepositoryAddToLovelace}>
        ${localize("repository.add_to_lovelace")}
      </mwc-button>
    `;
  }

  async RepositoryAddToLovelace() {
    const value = await swal(localize("confirm.add_to_lovelace"), {
      buttons: [localize("confirm.no"), localize("confirm.yes")],
    });

    if (value !== null) {
      this.hass.callWS({
        type: "lovelace/resources/create",
        res_type: "module",
        url: `/hacsfiles/${this.repository.full_name.split("/")[1]}/${
          this.repository.file_name
        }`,
      });
      this.dispatchEvent(
        new CustomEvent("hacs-force-reload", { bubbles: true, composed: true })
      );
    }
  }
}
