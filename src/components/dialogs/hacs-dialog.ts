import {
  css,
  CSSResultArray,
  customElement,
  html,
  TemplateResult,
  property,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import { HacsDialogBase } from "./hacs-dialog-base";

import { HacsStyles } from "../../styles/hacs-common-style";

@customElement("hacs-dialog")
export class HacsDialog extends HacsDialogBase {
  @property({ type: Boolean }) public noActions: boolean = false;
  @property({ type: Boolean }) public hasContent: boolean = true;
  @property({ type: Boolean }) public dynamicHeight: boolean = false;
  @property({ type: Boolean }) public hasFilter: boolean = false;

  protected render(): TemplateResult | void {
    if (!this.active) {
      return html``;
    }

    const sidebar = window.localStorage.getItem("dockedSidebar");

    const sidebarDocked = sidebar === '"docked"';

    return html`
      <div
        class=${classMap({
          backdrop: true,
          docked: sidebarDocked,
          "full-width": sidebar === '"always_hidden"',
          narrow: this.narrow,
        })}
      >
        <ha-card
          class=${classMap({
            dialog: true,
            "has-content": this.hasContent,
            "dynamic-height": this.dynamicHeight,
            narrow: this.narrow,
          })}
        >
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
          <slot name="filter"></slot>
          <div
            @scroll=${this._scrollEvent}
            class=${classMap({
              "card-content": true,
              noactions: this.noActions && !this.hasFilter,
              "dynamic-height": !this.narrow && this.dynamicHeight,
              "narrow-content": this.narrow,
            })}
          >
            <div class="content">
              <slot></slot>
            </div>
          </div>
          ${!this.noActions
            ? html` <div
                class=${classMap({
                  "card-actions": true,
                  "narrow-actions": this.narrow,
                })}
              >
                <slot name="actions"></slot>
              </div>`
            : ""}
        </ha-card>
      </div>
    `;
  }

  private _scrollEvent(ev) {
    this.dispatchEvent(
      new CustomEvent("scroll", {
        detail: {
          target: ev.target,
        },
        bubbles: true,
        composed: true,
      })
    );
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
      HacsStyles,
      css`
        ha-card {
          background-color: var(
            --paper-dialog-background-color,
            var(--card-background-color)
          );
          transition: none;
        }
        .header-group {
          position: absolute;
          width: 100%;
          display: flex;
          align-items: center;
          font-size: 20px;
          height: 65px;
          background-color: var(--primary-background-color);
          border-bottom: 1px solid var(--divider-color);
          font-weight: 400;
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
          line-height: 28px;
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
          position: relative;
          padding: 0;
          width: 100%;
          padding: 0;
          height: calc(100% - 136px);
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          margin-top: 65px;
        }
        ha-card.dynamic-height .noactions {
          margin-bottom: -65px;
        }
        .noactions {
          height: calc(100% - 68px);
        }
        .content {
          padding: 8px;
          height: fit-content;
        }

        ::slotted([slot="actions"]) {
          position: absolute;
          width: calc(100% - 32px);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 20px;
          height: 65px;
          background-color: var(--sidebar-background-color);
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
          left: var(--app-drawer-width);
          width: calc(100% - var(--app-drawer-width));
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
          height: 300px;
          margin: auto;
          max-height: calc(100% - 130px);
          max-width: 90%;
          min-width: 350px;
          overflow-x: hidden;
          padding-bottom: 65px;
          padding: unset;
          top: 64px;
          width: fit-content;
          z-index: 2;
        }
        .has-content {
          height: var(--hacs-dialog-height, -webkit-fill-available);
          height: var(--hacs-dialog-height, 100%);
        }

        .dynamic-height {
          height: auto;
        }
        ha-card.dynamic-height {
          padding-bottom: 65px;
        }

        .full-width {
          --app-drawer-width: 0%;
        }
      `,
    ];
  }
}
