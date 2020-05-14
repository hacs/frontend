import {
  css,
  CSSResultArray,
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";

import { HacsCommonStyle } from "../styles/hacs-common-style";
import { Repository } from "../data/common";
import { HomeAssistant } from "custom-card-helpers";

@customElement("hacs-repository-card")
export class HacsRepositoryCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public repository!: Repository;

  protected render(): TemplateResult | void {
    return html`
      <ha-card
        class=${classMap({
          "status-border":
            this.repository.new || this.repository.pending_upgrade,
          "status-new": this.repository.new,
          "status-update": this.repository.pending_upgrade,
        })}
      >
        <div class="card-content">
          <div class="group-header">
            ${this.repository.pending_upgrade
              ? html`
                  <div class="status-header update-header">PENDING UPDATE</div>
                `
              : this.repository.new
              ? html` <div class="status-header new-header">NEW</div> `
              : ""}

            <h2 class="pointer" @click=${this._showReopsitoryInfo}>
              ${this.repository.name}
            </h2>
          </div>
          <paper-item>
            <paper-item-body
              >${this.repository.description}</paper-item-body
            ></paper-item
          >
        </div>
        <div class="card-actions">
          ${this.repository.new
            ? html`<div>
                  <mwc-button @click=${this._showReopsitoryInfo}
                    >Install</mwc-button
                  >
                </div>
                <div>
                  <mwc-button class="right" @click=${this._showReopsitoryInfo}
                    >Information</mwc-button
                  >
                </div>
                <div>
                  <mwc-button class="right" @click=${this._showReopsitoryInfo}
                    >Hide</mwc-button
                  >
                </div>`
            : this.repository.pending_upgrade
            ? html`<div>
                <mwc-button class="right" @click=${this._openUpdateDialog}
                  >Update</mwc-button
                >
              </div>`
            : html`<div></div>`}
          ${this.repository.installed
            ? html` <paper-menu-button
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
                  <paper-item class="pointer" @click=${this._showReopsitoryInfo}
                    >Information</paper-item
                  >
                  <paper-item
                    class="pointer uninstall"
                    @click=${this._showReopsitoryInfo}
                    >Uninstall</paper-item
                  >
                </paper-listbox>
              </paper-menu-button>`
            : ""}
        </div>
      </ha-card>
    `;
  }

  private _showReopsitoryInfo() {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "generic",
          header: this.repository.name,
          content:
            this.repository.additional_info ||
            "No additional information is given by the developer",
          markdown: true,
          repository: this.repository,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _openUpdateDialog() {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "update",
          repository: this.repository,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  static get styles(): CSSResultArray {
    return [
      HacsCommonStyle,
      css`
        :host {
          max-width: 500px;
        }
        ha-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        :host(.highlight) ha-card {
          border: 1px solid var(--accent-color);
        }
        .card-content {
          padding: 0 0 3px 0;
          height: 100%;
        }
        .card-actions {
          border-top: none;
          bottom: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-right: 5px;
        }
        .group-header {
          display: flex;
          align-items: center;
          height: 40px;
          padding: 16px 16px 8px 16px;
          vertical-align: middle;
        }
        .group-header h2 {
          margin: 0;
        }
        h2 {
          margin-top: 0;
          min-height: 24px;
        }
        paper-menu-button {
          color: var(--secondary-text-color);
          padding: 0;
          float: right;
        }
        @media (min-width: 563px) {
          paper-listbox {
            max-height: 150px;
            overflow: auto;
          }
        }
        .pointer {
          cursor: pointer;
        }
        paper-item {
          min-height: 35px;
        }
        paper-item-body {
          opacity: var(--dark-primary-opacity);
        }

        .status-new {
          border-color: blue;
        }

        .status-update {
          border-color: orange;
        }

        .new-header {
          background-color: blue;
          color: white;
        }

        .update-header {
          background-color: orange;
          color: white;
        }

        .status-border {
          border-style: solid;
          border-width: 4px;
        }

        .status-header {
          position: absolute;
          top: 0;
          width: 100%;
          font-weight: 700;
          text-align: center;
          left: 0;
        }
        .uninstall {
          color: red;
        }
      `,
    ];
  }
}
