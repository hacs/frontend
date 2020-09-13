import { customElement, html, TemplateResult } from "lit-element";

import { HacsDialogBase } from "./hacs-dialog-base";
import "./hacs-dialog";
import { localize } from "../../localize/localize";

@customElement("hacs-reload-dialog")
export class HacsReloadDialog extends HacsDialogBase {
  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    return html`
      <hacs-dialog .active=${this.active} .hass=${this.hass} title="Reload">
        <div class="content">
          ${localize("dialog.reload.description")}
          </br>
          ${localize("dialog.reload.confirm")}
        </div>
        <mwc-button slot="secondaryaction" @click=${this._close}>
          ${localize("common.cancel")}
        </mwc-button>
        <mwc-button slot="primaryaction" @click=${this._reload}>
          ${localize("common.reload")}
        </mwc-button>
      </hacs-dialog>
    `;
  }

  private _reload() {
    window.top.location.reload(true);
  }

  private _close() {
    this.active = false;
    this.dispatchEvent(
      new Event("hacs-dialog-closed", {
        bubbles: true,
        composed: true,
      })
    );
  }
}
