import {
  LitElement,
  customElement,
  CSSResultArray,
  css,
  property
} from "lit-element";
import { HacsStyle } from "../../style/hacs-style";
import {
  RepositoryData,
  Configuration,
  Status,
  Route,
  LovelaceConfig
} from "../../data";
import { HACS } from "../../Hacs";
import { HomeAssistant } from "custom-card-helpers";

@customElement("hacs-repository-banner")
export class HacsRepositoryBanner extends LitElement {
  @property() public hacs!: HACS;
  @property() public configuration: Configuration;
  @property() public hass!: HomeAssistant;
  @property() public lovelaceconfig: LovelaceConfig;
  @property() public repository!: RepositoryData;
  @property() public route!: Route;
  @property() public status!: Status;

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`
        ha-card {
          width: 90%;
          margin-left: 5%;
        }
        ha-card.alert {
          background-color: var(
            --hacs-status-pending-restart,
            var(--google-red-500)
          );
          color: var(--text-primary-color);
        }
        ha-card.warning {
          background-color: var(--hacs-status-pending-update);
          color: var(--primary-text-color);
        }
        ha-card.info {
          background-color: var(--primary-background-color);
          color: var(--primary-text-color);
        }
      `
    ];
  }
}
