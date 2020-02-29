import {
  LitElement,
  customElement,
  TemplateResult,
  html,
  property
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";
import { HACS } from "../Hacs";
import { Route, LovelaceConfig, LovelaceResourceConfig } from "../data";

@customElement("hacs-settings")
export class HacsSettings extends LitElement {
  @property() public hacs!: HACS;
  @property() public hass!: HomeAssistant;
  @property() public lovelaceconfig: LovelaceConfig | LovelaceResourceConfig[];
  @property() public route!: Route;

  render(): TemplateResult | void {
    if (this.hacs === undefined) {
      return html`
        <hacs-progressbar></hacs-progressbar>
      `;
    }
    return html`
      <hacs-body>
        <hacs-legacy-url-for-plugins
          .hass=${this.hass}
          .lovelaceconfig=${this.lovelaceconfig}
        >
        </hacs-legacy-url-for-plugins>
        <hacs-custom-repositories .hacs=${this.hacs} .route=${this.route}>
        </hacs-custom-repositories>
        <hacs-hidden-repositories .hacs=${this.hacs}>
        </hacs-hidden-repositories>
      </hacs-body>
    `;
  }
}
