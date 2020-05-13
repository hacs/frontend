import {
  LitElement,
  customElement,
  property,
  html,
  css,
  TemplateResult,
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";
import {
  Route,
  Configuration,
  Repository,
  LovelaceResource,
} from "../data/common";

import "../components/dialogs/hacs-about-dialog";

@customElement("hacs-tabbed-menu")
export class HacsTabbedMenu extends LitElement {
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public repositories!: Repository[];
  @property({ attribute: false }) public lovelace: LovelaceResource[];

  @property({ attribute: false }) private _aboutDialogActive: boolean = false;

  protected render(): TemplateResult | void {
    return html`<paper-menu-button
        slot="toolbar-icon"
        horizontal-align="right"
        vertical-align="top"
        vertical-offset="40"
        close-on-activate
      >
        <ha-icon-button
          icon="hass:dots-vertical"
          slot="dropdown-trigger"
        ></ha-icon-button>
        <paper-listbox slot="dropdown-content">
          <paper-item class="pointer" @click=${this._showAboutDialog}
            >About HACS</paper-item
          >
        </paper-listbox>
      </paper-menu-button>
      ${this._aboutDialogActive
        ? html` <hacs-about-dialog
            .hass=${this.hass}
            .narrow=${this.narrow}
            .active=${true}
            .configuration=${this.configuration}
            .repositories=${this.repositories}
          ></hacs-about-dialog>`
        : ""} `;
  }

  private _showAboutDialog() {
    this._aboutDialogActive = true;
    this.addEventListener(
      "hacs-dialog-closed",
      () => (this._aboutDialogActive = false)
    );
  }

  static get styles() {
    return css`
      paper-item {
        cursor: pointer;
      }
    `;
  }
}
