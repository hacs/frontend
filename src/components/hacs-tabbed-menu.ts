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

@customElement("hacs-tabbed-menu")
export class HacsTabbedMenu extends LitElement {
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public repositories!: Repository[];
  @property({ attribute: false }) public lovelace: LovelaceResource[];

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
        <hacs-link url="https://hacs.xyz/"
          ><paper-item>Documentation</paper-item></hacs-link
        >
        <paper-item @click=${() => window.location.reload(true)}
          >Reload window</paper-item
        >
        <hacs-link url="https://github.com/hacs"
          ><paper-item>GitHub</paper-item></hacs-link
        >
        <hacs-link url="https://hacs.xyz/docs/issues"
          ><paper-item>Open issue</paper-item></hacs-link
        >
        <paper-item @click=${this._showAboutDialog}>About HACS</paper-item>
      </paper-listbox>
    </paper-menu-button>`;
  }

  private _showAboutDialog() {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "about",
          configuration: this.configuration,
          repositories: this.repositories,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  static get styles() {
    return css`
      paper-menu-button {
        color: var(--secondary-text-color);
        padding: 0;
      }
      paper-item {
        cursor: pointer;
      }
      paper-item-body {
        opacity: var(--dark-primary-opacity);
      }
    `;
  }
}
