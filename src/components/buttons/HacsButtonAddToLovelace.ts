import { customElement, TemplateResult, html, property } from "lit-element";
import swal from "sweetalert";
import { HacsRepositoryButton } from "./HacsRepositoryButton";

import { LovelaceConfig, LovelaceResourceConfig } from "../../data";

import { localize } from "../../localize/localize";

import { Logger } from "../../misc/Logger";

@customElement("hacs-button-add-to-lovelace")
export class HacsButtonAddToLovelace extends HacsRepositoryButton {
  logger = new Logger("add_to_lovelace");
  render(): TemplateResult | void {
    if (!this.repository.installed) return html``;

    return html`
      <mwc-button @click=${this.RepositoryAddToLovelace}>
        Add to Lovelace
      </mwc-button>
    `;
  }

  async RepositoryAddToLovelace() {
    const value = await swal(localize("confirm.add_to_lovelace"), {
      buttons: [localize("confirm.no"), localize("confirm.yes")]
    });

    if (value !== null) {
      if (this.hass.config.version.split(".")[1] <= "106") {
        this.hass.connection
          .sendMessagePromise({
            type: "lovelace/config",
            force: false
          })
          .then(
            resp => {
              var currentConfig = resp as LovelaceConfig;
              const cardConfig: LovelaceResourceConfig = {
                type: "module",
                url: `/hacsfiles/${this.repository.full_name.split("/")[1]}/${
                  this.repository.file_name
                }`
              };
              if (currentConfig.resources)
                currentConfig.resources!.push(cardConfig);
              else currentConfig.resources = [cardConfig];

              this.hass.callWS({
                type: "lovelace/config/save",
                config: currentConfig
              });
            },
            err => {
              this.logger.error(err);
            }
          );
      } else {
        this.hass.callWS({
          type: "lovelace/resources/create",
          res_type: "module",
          url: `/hacsfiles/${this.repository.full_name.split("/")[1]}/${
            this.repository.file_name
          }`
        });
      }
      this.dispatchEvent(
        new CustomEvent("hacs-force-reload", { bubbles: true, composed: true })
      );
    }
  }
}
