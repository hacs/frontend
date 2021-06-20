import "@material/mwc-list/mwc-list-item";
import { mdiDotsVertical } from "@mdi/js";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import "../../homeassistant-frontend/src/components/ha-button-menu";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { Configuration, LovelaceResource, Repository, Status } from "../data/common";
import { Hacs } from "../data/hacs";
import { settingsClearAllNewRepositories } from "../data/websocket";
import { activePanel } from "../panels/hacs-sections";
import { showDialogAbout } from "./dialogs/hacs-about-dialog";
import "./hacs-link";

@customElement("hacs-tabbed-menu")
export class HacsTabbedMenu extends LitElement {
  @property({ attribute: false }) public configuration!: Configuration;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public hacs!: Hacs;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public repositories!: Repository[];
  @property({ attribute: false }) public lovelace: LovelaceResource[];
  @property({ attribute: false }) public status: Status;

  protected render(): TemplateResult | void {
    return html`
      <ha-button-menu corner="BOTTOM_START" slot="toolbar-icon">
        <mwc-icon-button slot="trigger" alt="menu">
          <ha-svg-icon .path=${mdiDotsVertical}></ha-svg-icon>
        </mwc-icon-button>

        <mwc-list-item action="documentation">
          <hacs-link url="https://hacs.xyz/">
            ${this.hacs.localize("menu.documentation")}
          </hacs-link>
        </mwc-list-item>

        ${this.repositories?.filter((repo) => repo.new).length !== 0
          ? html`<mwc-list-item @click=${this._clearAllNewRepositories}>
              ${this.hacs.localize("menu.dismiss")}
            </mwc-list-item>`
          : ""}

        <mwc-list-item><hacs-link url="https://github.com/hacs">GitHub</hacs-link></mwc-list-item>
        <mwc-list-item>
          <hacs-link url="https://hacs.xyz/docs/issues"
            >${this.hacs.localize("menu.open_issue")}</hacs-link
          >
        </mwc-list-item>

        ${!this.status?.disabled && !this.status?.background_task
          ? html`<mwc-list-item @click=${this._showCustomRepositoriesDialog}>
              ${this.hacs.localize("menu.custom_repositories")}
            </mwc-list-item>`
          : ""}

        <mwc-list-item @click=${this._showAboutDialog}>
          ${this.hacs.localize("menu.about")}
        </mwc-list-item>
      </ha-button-menu>
    `;
  }

  private async _clearAllNewRepositories() {
    await settingsClearAllNewRepositories(
      this.hass,
      activePanel(this.hacs.language, this.route)?.categories || []
    );
  }

  private _showAboutDialog() {
    showDialogAbout(this, this.hacs);
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
    return css``;
  }
}
