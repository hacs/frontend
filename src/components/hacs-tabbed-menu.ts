import "@polymer/paper-menu-button/paper-menu-button";
import "@polymer/paper-listbox/paper-listbox";
import "@polymer/paper-item/paper-item";

import { mdiDotsVertical } from "@mdi/js";

import { LitElement, customElement, property, html, css, TemplateResult } from "lit-element";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { Status, Configuration, Repository, LovelaceResource } from "../data/common";
import { localize } from "../localize/localize";
import "../../homeassistant-frontend/src/components/ha-icon-button";

import "../components/hacs-link";
import "../components/hacs-icon-button";

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
      <hacs-icon-button .icon=${mdiDotsVertical} slot="dropdown-trigger"></hacs-icon-button>
      <paper-listbox slot="dropdown-content">
        <hacs-link url="https://hacs.xyz/"
          ><paper-item>${localize("menu.documentation")}</paper-item></hacs-link
        >
        ${this.repositories?.filter((repo) => repo.new).length !== 0
          ? html` <paper-item @tap=${this._clearAllNewRepositories}
              >${localize("menu.dismiss")}</paper-item
            >`
          : ""}

        <hacs-link url="https://github.com/hacs"><paper-item>GitHub</paper-item></hacs-link>
        <hacs-link url="https://hacs.xyz/docs/issues"
          ><paper-item>${localize("menu.open_issue")}</paper-item></hacs-link
        >
        ${!this.status?.disabled && !this.status?.background_task
          ? html`<paper-item @tap=${this._showCustomRepositoriesDialog}
              >${localize("menu.custom_repositories")}</paper-item
            >`
          : ""}

        <paper-item @tap=${this._showAboutDialog}>${localize("menu.about")}</paper-item>
      </paper-listbox>
    </paper-menu-button>`;
  }

  private async _clearAllNewRepositories() {
    //const section = sections.panels.find((s) => s.id === this.route.path.replace("/", ""));
    //await settingsClearAllNewRepositories(this.hass, section.categories);
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
      hacs-icon-button {
        color: var(--secondary-text-color);
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
