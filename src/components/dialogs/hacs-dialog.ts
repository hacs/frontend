import {
  css,
  CSSResultArray,
  customElement,
  html,
  TemplateResult,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import { HacsDialogBase } from "./hacs-dialog-base";

import { HacsCommonStyle } from "../../styles/hacs-common-style";

@customElement("hacs-dialog")
export class HacsDialog extends HacsDialogBase {
  protected render(): TemplateResult | void {
    if (!this.active) {
      return html``;
    }

    const sidebarDocked =
      window.localStorage.getItem("dockedSidebar") === '"docked"';

    return html`
      <div
        class=${classMap({
          backdrop: true,
          docked: sidebarDocked,
          narrow: this.narrow,
        })}
      >
        <ha-card
          class=${classMap({
            dialog: true,
            narrow: this.narrow,
          })}
        >
          <div class="content">
            <div class="header-group">
              <ha-icon-button
                class="close"
                icon="mdi:close"
                @click=${this._close}
              ></ha-icon-button>
              <div
                class=${classMap({
                  header: true,
                  "narrow-header": this.narrow,
                })}
              >
                <slot name="header"></slot>
              </div>
            </div>
            <div
              class=${classMap({
                "card-content": true,
                "narrow-content": this.narrow,
              })}
            >
              <slot></slot>
            </div>
            <div
              class=${classMap({
                "card-actions": true,
                "narrow-actions": this.narrow,
              })}
            >
              <slot name="actions"></slot>
            </div>
          </div>
        </ha-card>
      </div>
    `;
  }

  private _close() {
    this.dispatchEvent(
      new Event(
        this.secondary ? "hacs-secondary-dialog-closed" : "hacs-dialog-closed",
        { bubbles: true, composed: true }
      )
    );
  }

  static get styles(): CSSResultArray {
    return [
      HacsCommonStyle,
      css`
        ha-card {
          background-color: var(--card-background-color);
        }
        .header-group {
          position: absolute;
          width: 100%;
          display: flex;
          align-items: center;
          font-size: 20px;
          height: 65px;
          background-color: var(--secondary-background-color);
          border-bottom: 1px solid var(--divider-color);
          font-weight: 400;
          color: var(--sidebar-text-color);
          font-family: var(--paper-font-body1_-_font-family);
          padding: 12px 16px;
          box-sizing: border-box;
        }
        .header {
          -webkit-font-smoothing: var(
            --paper-font-headline_-_-webkit-font-smoothing
          );
          font-family: var(--paper-font-headline_-_font-family);
          font-size: var(--paper-font-headline_-_font-size);
          font-weight: var(--paper-font-headline_-_font-weight);
          letter-spacing: var(--paper-font-headline_-_letter-spacing);
          line-height: 26px;
          max-height: 26px;
          opacity: var(--dark-primary-opacity);
          overflow: hidden;
          padding: 4px;
          text-overflow: ellipsis;
        }
        .close {
          pointer-events: auto;
          color: var(--sidebar-icon-color);
          --mdc-icon-size: 32px;
        }

        .card-content {
          padding: 65px 4px;
        }

        ::slotted([slot="actions"]) {
          position: absolute;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 20px;
          height: 65px;
          background-color: var(--sidebar-background-color);
          border-top: 1px solid var(--divider-color);
          font-weight: 400;
          color: var(--sidebar-text-color);
          font-family: var(--paper-font-body1_-_font-family);
          padding: 12px 16px;
          box-sizing: border-box;
        }

        .backdrop {
          background-color: rgba(0, 0, 0, 0.75);
          height: 100%;
          position: fixed;
          z-index: 1;
          top: 0;
          left: 64px;
          width: calc(100% - 64px);
        }

        .docked {
          left: 256px !important;
          width: calc(100% - 256px) !important;
        }

        .narrow {
          top: 0 !important;
          left: 0 !important;
          bottom: 0 !important;
          right: 0 !important;
          height: 100% !important;
          width: 100% !important;
          max-height: 100% !important;
          max-width: 100% !important;
        }

        .dialog {
          top: 64px;
          min-width: 350px;
          max-height: calc(90% - 64px);
          max-width: 90%;
          z-index: 2;
          overflow-x: hidden;
          height: auto;
          width: fit-content;
          margin: auto;
        }
      `,
    ];
  }
}
