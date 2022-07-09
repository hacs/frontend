import "@material/mwc-button/mwc-button";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { ClassInfo, classMap } from "lit/directives/class-map";
import "../../homeassistant-frontend/src/components/ha-card";
import "../../homeassistant-frontend/src/components/ha-chip";
import "../../homeassistant-frontend/src/components/ha-icon-overflow-menu";
import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { Hacs } from "../data/hacs";
import { RepositoryBase } from "../data/repository";
import { clearNewRepositories } from "../data/websocket";
import { HacsStyles } from "../styles/hacs-common-style";
import "./hacs-link";

@customElement("hacs-repository-card")
export class HacsRepositoryCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public hacs!: Hacs;

  @property({ attribute: false }) public repository!: RepositoryBase;

  @property({ type: Boolean }) public narrow!: boolean;

  private get _borderClass(): ClassInfo {
    const classes = {};
    if (
      !this.hacs.addedToLovelace!(this.hacs, this.repository) ||
      this.repository.status === "pending-restart"
    ) {
      classes["status-issue"] = true;
    } else if (this.repository.pending_upgrade) {
      classes["status-update"] = true;
    } else if (this.repository.new && !this.repository.installed) {
      classes["status-new"] = true;
    }
    if (Object.keys(classes).length !== 0) {
      classes["status-border"] = true;
    }

    return classes;
  }

  private get _headerClass(): ClassInfo {
    const classes = {};
    if (
      !this.hacs.addedToLovelace!(this.hacs, this.repository) ||
      this.repository.status === "pending-restart"
    ) {
      classes["issue-header"] = true;
    } else if (this.repository.pending_upgrade) {
      classes["update-header"] = true;
    } else if (this.repository.new && !this.repository.installed) {
      classes["new-header"] = true;
    } else {
      classes["default-header"] = true;
    }

    return classes;
  }

  private get _headerTitle(): string {
    if (!this.hacs.addedToLovelace!(this.hacs, this.repository)) {
      return this.hacs.localize("repository_card.not_loaded");
    }
    if (this.repository.status === "pending-restart") {
      return this.hacs.localize("repository_card.pending_restart");
    }
    if (this.repository.pending_upgrade) {
      return this.hacs.localize("repository_card.pending_update");
    }
    if (this.repository.new && !this.repository.installed) {
      return this.hacs.localize("repository_card.new_repository");
    }
    return "";
  }

  protected render(): TemplateResult | void {
    return html`
      <a href="/hacs/repository/${this.repository.id}">
        <ha-card class=${classMap(this._borderClass)} ?narrow=${this.narrow} outlined>
          <div class="card-content">
            <div class="group-header">
              <div class="status-header ${classMap(this._headerClass)}">${this._headerTitle}</div>

              <div class="title pointer">
                <h1>${this.repository.name}</h1>
                ${this.repository.category !== "integration"
                  ? html` <ha-chip>
                      ${this.hacs.localize(`common.${this.repository.category}`)}
                    </ha-chip>`
                  : ""}
              </div>
            </div>
            <div class="description">${this.repository.description}</div>
          </div>
          <div class="card-actions">
            ${this.repository.new && !this.repository.installed
              ? html`<div>
                  <mwc-button class="status-new" @click=${this._setNotNew}>
                    ${this.hacs.localize("repository_card.dismiss")}
                  </mwc-button>
                </div>`
              : this.repository.pending_upgrade &&
                this.hacs.addedToLovelace!(this.hacs, this.repository)
              ? html`<div>
                  <mwc-button class="update-header" @click=${this._updateRepository} raised>
                    ${this.hacs.localize("common.update")}
                  </mwc-button>
                </div> `
              : ""}
          </div>
        </ha-card>
      </a>
    `;
  }

  private _updateRepository(ev: Event) {
    ev.preventDefault();
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "update",
          repository: this.repository.id,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _setNotNew(ev: Event) {
    ev.preventDefault();
    await clearNewRepositories(this.hass, { repository: String(this.repository.id) });
  }

  static get styles(): CSSResultGroup {
    return [
      HacsStyles,
      css`
        ha-card {
          display: flex;
          flex-direction: column;
          height: 195px;
          width: 480px;
        }

        .title {
          display: flex;
          justify-content: space-between;
        }
        .card-content {
          padding: 0 0 3px 0;
          height: 100%;
        }
        .card-actions {
          border-top: none;
          bottom: 0;
          display: flex;
          flex-direction: row-reverse;
          justify-content: space-between;
          align-items: center;
          padding: 5px;
        }
        .group-header {
          height: auto;
          align-content: center;
        }
        .group-header h1 {
          margin: 0;
          padding: 8px 16px;
          font-size: 22px;
        }
        h1 {
          margin-top: 0;
          min-height: 24px;
        }
        a {
          all: unset;
          cursor: pointer;
        }

        .description {
          opacity: var(--dark-primary-opacity);
          font-size: 14px;
          padding: 8px 16px;
          max-height: 52px;
          overflow: hidden;
        }

        .status-new {
          border-color: var(--hcv-color-new);
          --mdc-theme-primary: var(--hcv-color-new);
        }

        .status-update {
          border-color: var(--hcv-color-update);
        }

        .status-issue {
          border-color: var(--hcv-color-error);
        }

        .new-header {
          background-color: var(--hcv-color-new);
          color: var(--hcv-text-color-on-background);
        }

        .issue-header {
          background-color: var(--hcv-color-error);
          color: var(--hcv-text-color-on-background);
        }

        .update-header {
          background-color: var(--hcv-color-update);
          color: var(--hcv-text-color-on-background);
        }

        .default-header {
          padding: 2px 0 !important;
        }

        mwc-button.update-header {
          --mdc-theme-primary: var(--hcv-color-update);
          --mdc-theme-on-primary: var(--hcv-text-color-on-background);
        }

        .status-border {
          border-style: solid;
          border-width: min(var(--ha-card-border-width, 1px), 10px);
        }

        .status-header {
          top: 0;
          padding: 6px 1px;
          margin: -1px;
          width: 100%;
          font-weight: 500;
          text-align: center;
          left: 0;
          border-top-left-radius: var(--ha-card-border-radius, 4px);
          border-top-right-radius: var(--ha-card-border-radius, 4px);
        }

        ha-card[narrow] {
          width: calc(100% - 24px);
          margin: 11px;
        }

        ha-chip {
          padding: 4px;
          margin-top: 3px;
        }
      `,
    ];
  }
}
