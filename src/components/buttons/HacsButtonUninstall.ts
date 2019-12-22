import {
  customElement,
  CSSResultArray,
  css,
  TemplateResult,
  html
} from "lit-element";
import { HacsStyle } from "../../style/hacs-style";
import { HacsRepositoryButton } from "./HacsRepositoryButton";
import { RepositoryWebSocketAction } from "../../tools";
import swal from "sweetalert";
import { LovelaceConfig, LovelaceResourceConfig } from "../../types";
import { localize } from "../../localize/localize";

@customElement("hacs-button-uninstall")
export class HacsButtonUninstall extends HacsRepositoryButton {
  protected render(): TemplateResult | void {
    if (!this.repository.installed) return html``;

    const label = localize("repository.uninstall");
    if (this.status.background_task) {
      return html`
        <mwc-button
          class="disabled-button"
          title="${localize("confirm.bg_task")}"
          @click=${this.disabledAction}
        >
          ${label}
        </mwc-button>
      `;
    }

    return html`
        <mwc-button @click=${this.RepositoryUnInstall}">
            ${
              this.repository.state == "uninstalling"
                ? html`
                    <paper-spinner active></paper-spinner>
                  `
                : html`
                    ${label}
                  `
            }
        </mwc-button>
        `;
  }
  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`
        mwc-button {
          --mdc-theme-primary: var(--google-red-500);
        }
      `
    ];
  }

  disabledAction() {
    swal(localize("confirm.bg_task"));
  }

  RepositoryUnInstall() {
    swal(localize("confirm.uninstall", "{item}", this.repository.name), {
      buttons: [localize("confirm.cancel"), localize("confirm.yes")]
    }).then(value => {
      if (value !== null) {
        this.ExecuteAction();
      }
    });
  }

  ExecuteAction() {
    RepositoryWebSocketAction(
      this.hass,
      this.repository.id,
      "set_state",
      "uninstalling"
    );
    if (
      this.repository.category === "plugin" &&
      this.status.lovelace_mode === "storage"
    ) {
      this.RepositoryRemoveFromLovelace();
    }
    RepositoryWebSocketAction(this.hass, this.repository.id, "uninstall");
  }
  RepositoryRemoveFromLovelace() {
    this.hass.connection
      .sendMessagePromise({
        type: "lovelace/config",
        force: false
      })
      .then(resp => {
        const currentConfig = resp as LovelaceConfig;
        const url = `/community_plugin/${
          this.repository.full_name.split("/")[1]
        }/${this.repository.file_name}`;

        if (currentConfig.resources) {
          const resources: LovelaceResourceConfig[] = currentConfig.resources.filter(
            (element: LovelaceResourceConfig) => {
              if (element.url === url) {
                return false;
              } else return true;
            }
          );
          currentConfig.resources = resources;
          this.hass.callWS({
            type: "lovelace/config/save",
            config: currentConfig
          });
        }
      });
  }
}
