import {
  LitElement,
  customElement,
  CSSResultArray,
  TemplateResult,
  html,
  css,
  property
} from "lit-element";

import { HomeAssistant } from "custom-card-helpers";
import { HacsStyle } from "../style/hacs-style"

import "../misc/CustomRepositories"

import { Configuration, Repository, Status } from "../types"

@customElement("hacs-panel-settings")
export class HacsPanelSettings extends LitElement {
  @property() public hass!: HomeAssistant;
  @property() public repositories!: Repository[]
  @property() public configuration!: Configuration
  @property() public status!: Status

  render(): TemplateResult | void {
    if (this.status.reloading_data) var reload_disable = "disabled"; else reload_disable = "";
    return html`

    <ha-card header="${this.hass.localize("component.hacs.config.title")}">
      <div class="card-content">
        <p><b>${this.hass.localize("component.hacs.common.version")}:</b> ${this.configuration.version}</p>
        <p><b>${this.hass.localize("component.hacs.common.repositories")}:</b> ${this.repositories.length}</p>
        <div class="version-available">
        <paper-dropdown-menu label="${this.hass.localize(`component.hacs.settings.display`)}">
            <paper-listbox slot="dropdown-content" selected="-1">
              <paper-item .display="grid" @click="${this.SetFeStyleGrid}">
                ${this.hass.localize(`component.hacs.settings.grid`)}
              </paper-item>
              <paper-item .display="table" @click="${this.SetFeStyleTable}">
                ${this.hass.localize(`component.hacs.settings.table`)}
              </paper-item>
            </paper-listbox>
        </paper-dropdown-menu>
    </div>
      </div>
      <div class="card-actions">

      ${(this.status.reloading_data ? html`
          <mwc-button raised disabled>
            <paper-spinner active></paper-spinner>
          </mwc-button>
      ` : html`
          <mwc-button raised @click=${this.ReloadData}>
            ${this.hass.localize(`component.hacs.settings.reload_data`)}
          </mwc-button>
      `)}


      ${(this.status.upgrading_all ? html`
          <mwc-button raised disabled>
            <paper-spinner active></paper-spinner>
          </mwc-button>
      ` : html`
          <mwc-button raised @click=${this.UpgradeAll}>
            ${this.hass.localize(`component.hacs.settings.upgrade_all`)}
          </mwc-button>
      `)}

      <a href="https://github.com/hacs/integration" target="_blank" rel="noreferrer">
        <mwc-button raised>
          ${this.hass.localize(`component.hacs.settings.hacs_repo`)}
        </mwc-button>
      </a>

      <a href="https://github.com/hacs/integration/issues" target="_blank" rel="noreferrer">
        <mwc-button raised>
          ${this.hass.localize(`component.hacs.repository.open_issue`)}
        </mwc-button>
      </a>
      </div>
    </ha-card>
    <hacs-custom-repositories
      .hass=${this.hass}
      .status=${this.status}
      .configuration=${this.configuration}
      .repositories=${this.repositories}
    >
    </hacs-custom-repositories>
          `;
  }

  SetFeStyleGrid() {
    this.hass.connection.sendMessage({
      type: "hacs/settings",
      action: "set_fe_grid"
    });
  }

  SetFeStyleTable() {
    this.hass.connection.sendMessage({
      type: "hacs/settings",
      action: "set_fe_table"
    });
  }

  ReloadData() {
    this.hass.connection.sendMessage({
      type: "hacs/settings",
      action: "reload_data"
    });
  }

  UpgradeAll() {
    var elements: Repository[] = []
    this.repositories.forEach(element => {
      if (element.pending_upgrade)
        elements.push(element)
    });
    if (elements.length > 0) {
      var msg = "This will upgrade all of these repositores, make sure that you have read the release notes for all of them before proceeding."
      msg += "\n"
      msg += "\n"
      elements.forEach(element => {
        msg += `${element.name} ${element.installed_version} -> ${element.available_version}\n`
      });
      if (!window.confirm(msg)) return;
      this.hass.connection.sendMessage({
        type: "hacs/settings",
        action: "upgrade_all"
      });
    } else {
      window.alert("No upgrades pending")
    }

  }

  static get styles(): CSSResultArray {
    return [HacsStyle, css`
    ha-card {
      width: 90%;
      margin-left: 5%;
    }
    mwc-button {
      margin: 0 8px 0 8px;
    }
    `]
  }
}