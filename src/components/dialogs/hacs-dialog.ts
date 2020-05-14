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
          <div
            class=${classMap({
              header: true,
              "header-narrow": this.narrow,
            })}
          >
            <slot name="header"></slot>
          </div>
          <ha-icon-button
            class="close"
            icon="mdi:close"
            @click=${this._close}
          ></ha-icon-button>
          <div class="card-content">
            <slot></slot>
          </div>
        </ha-card>
      </div>
    `;
  }

  private _close() {
    this.dispatchEvent(
      new Event("hacs-dialog-closed", { bubbles: true, composed: true })
    );
  }

  static get styles(): CSSResultArray {
    return [
      HacsCommonStyle,
      css`
        ha-card {
          background-color: var(--card-background-color);
        }
        .header {
          padding-right: 42px !important;
          width: max-content;
        }
        .close {
          position: absolute;
          top: 0;
          right: 0;
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

        .header-narrow {
          padding-top: 42px;
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
          min-width: 333px;
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
