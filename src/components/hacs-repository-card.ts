import {
  css,
  CSSResultArray,
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";
import { HacsCommonStyle } from "../styles/hacs-common-style";
import "../components/dialogs/hacs-repository-info-dialog";
import { Repository } from "../data/common";
import { HomeAssistant } from "custom-card-helpers";

@customElement("hacs-repository-card")
export class HacsRepositoryCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public repository!: Repository;
  @property() private _updateDialogActive: boolean = false;

  protected render(): TemplateResult | void {
    return html`
      <ha-card>
        <div class="card-content">
          <div class="group-header">
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
          <div>
            <mwc-button>install</mwc-button>
          </div>
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
                    >Show information</paper-item
                  >
                </paper-listbox>
              </paper-menu-button>`
            : ""}
        </div>
      </ha-card>
      ${this._updateDialogActive
        ? html` <hacs-repository-info-dialog
            .hass=${this.hass}
            .narrow=${this.narrow}
            .active=${true}
            .repository=${this.repository}
          ></hacs-repository-info-dialog>`
        : ""}
    `;
  }

  private _showReopsitoryInfo() {
    this._updateDialogActive = true;
    this.addEventListener(
      "hacs-dialog-closed",
      () => (this._updateDialogActive = false)
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
      `,
    ];
  }
}
