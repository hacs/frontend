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
import { LovelaceConfig, LovelaceResourceConfig } from "../../data";
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

  async RepositoryUnInstall() {
    const value = await swal(
      localize("confirm.uninstall", "{item}", this.repository.name),
      {
        buttons: [localize("confirm.no"), localize("confirm.yes")]
      }
    );

    if (value !== null) {
      await this.ExecuteAction();
    }
  }

  async ExecuteAction() {
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
      await this.RepositoryRemoveFromLovelace();
    }
    RepositoryWebSocketAction(this.hass, this.repository.id, "uninstall");
  }
  async RepositoryRemoveFromLovelace() {
    const url1 = `/community_plugin/${
      this.repository.full_name.split("/")[1]
    }/${this.repository.file_name}`;
    const url2 = `/hacsfiles/${this.repository.full_name.split("/")[1]}/${
      this.repository.file_name
    }`;
    if (this.hass.config.version.split(".")[1] <= "106") {
      this.hass.connection
        .sendMessagePromise({
          type: "lovelace/config",
          force: false
        })
        .then(resp => {
          const currentConfig = resp as LovelaceConfig;

          if (currentConfig.resources) {
            const resources: LovelaceResourceConfig[] = currentConfig.resources.filter(
              (element: LovelaceResourceConfig) => {
                if (element.url === url1 || element.url === url2) {
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
    } else {
      const resources = await this.hass.callWS<LovelaceResourceConfig[]>({
        type: "lovelace/resources"
      });
      const resource: LovelaceResourceConfig = resources.find(function(
        element
      ) {
        return element.url === url1 || element.url === url2;
      });
      this.hass.callWS({
        type: "lovelace/resources/delete",
        resource_id: resource.id
      });
    }
  }
}
