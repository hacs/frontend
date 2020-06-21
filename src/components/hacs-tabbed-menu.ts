import { LitElement, customElement, property, html, css, TemplateResult } from "lit-element";
import { HomeAssistant } from "custom-card-helpers";
import { Route, Status, Configuration, Repository, LovelaceResource } from "../data/common";
import { localize } from "../localize/localize";
import { settingsClearAllNewRepositories } from "../data/websocket";

import { sections } from "../panels/hacs-sections";
import "../components/hacs-link";

@customElement("hacs-tabbed-menu")
export class HacsTabbedMenu extends LitElement {
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public repositories!: Repository[];
  @property({ attribute: false }) public lovelace: LovelaceResource[];
  @property({ attribute: false }) public status: Status;

  protected render(): TemplateResult | void {
    return html`<paper-menu-button
      slot="toolbar-icon"
      horizontal-align="right"
      vertical-align="top"
      vertical-offset="40"
      close-on-activate
    >
      <ha-icon-button icon="hass:dots-vertical" slot="dropdown-trigger"></ha-icon-button>
      <paper-listbox slot="dropdown-content">
        <hacs-link url="https://hacs.xyz/"
          ><paper-item>${localize("menu.documentation")}</paper-item></hacs-link
        >
        <paper-item @tap=${() => window.location.reload(true)}
          >${localize("menu.reload")}</paper-item
        >
        ${this.repositories?.filter((repo) => repo.new).length !== 0
          ? html` <paper-item @click=${this._clearAllNewRepositories}
              >${localize("menu.dismiss")}</paper-item
            >`
          : ""}

        <hacs-link url="https://github.com/hacs"><paper-item>GitHub</paper-item></hacs-link>
        <hacs-link url="https://hacs.xyz/docs/issues"
          ><paper-item>${localize("menu.open_issue")}</paper-item></hacs-link
        >
        ${!this.status?.disabled && !this.status?.background_task
          ? html`<paper-item @click=${this._showCustomRepositoriesDialog}
              >${localize("menu.custom_repositories")}</paper-item
            >`
          : ""}

        <paper-item @tap=${this._showAboutDialog}>${localize("menu.about")}</paper-item>
      </paper-listbox>
    </paper-menu-button>`;
  }

  private async _clearAllNewRepositories() {
    const section = sections.panels.find((s) => s.id === this.route.path.replace("/", ""));
    await settingsClearAllNewRepositories(this.hass, section.categories);
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

  private _showCustomRepositoriesDialog() {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "custom-repositories",
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
        color: var(--hcv-text-color-secondary);
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
