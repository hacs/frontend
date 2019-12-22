import { customElement, TemplateResult, html, property } from "lit-element";
import swal from "sweetalert";
import { HacsRepositoryButton } from "./HacsRepositoryButton";

import {
  Configuration,
  LovelaceConfig,
  LovelaceResourceConfig
} from "../../types";

import { localize } from "../../localize/localize";

import { Logger } from "../../misc/Logger";

@customElement("hacs-button-add-to-lovelace")
export class HacsButtonAddToLovelace extends HacsRepositoryButton {
  @property({ type: Object }) public configuration: Configuration;
  @property({ type: Object }) public lovelaceconfig: LovelaceConfig;

  logger = new Logger("add_to_lovelace");

  render(): TemplateResult | void {
    if (!this.repository.installed) return html``;
    if (this.repository.javascript_type === null) return html``;

    return html`
      <mwc-button @click=${this.RepositoryAddToLovelace}>
        Add to Lovelace
      </mwc-button>
    `;
  }

  RepositoryAddToLovelace() {
    swal(localize("confirm.add_to_lovelace"), {
      buttons: [localize("confirm.cancel"), localize("confirm.yes")]
    }).then(value => {
      if (value !== null) {
        this.hass.connection
          .sendMessagePromise({
            type: "lovelace/config",
            force: false
          })
          .then(
            resp => {
              var currentConfig = resp as LovelaceConfig;
              const cardConfig: LovelaceResourceConfig = {
                type: this.repository.javascript_type as
                  | "css"
                  | "js"
                  | "module"
                  | "html",
                url: `/community_plugin/${
                  this.repository.full_name.split("/")[1]
                }/${this.repository.file_name}`
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
      }
    });
  }
}
