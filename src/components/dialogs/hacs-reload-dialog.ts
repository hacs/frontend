import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";

@customElement("hacs-reload-dialog")
export class HacsReloadDialog extends HacsDialogBase {
  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    return html`
      <hacs-dialog .active=${this.active} .hass=${this.hass} title="Reload">
        <div class="content">
          ${this.hacs.localize("dialog.reload.description")}
          </br>
          ${this.hacs.localize("dialog.reload.confirm")}
        </div>
        <mwc-button slot="secondaryaction" @click=${this._close}>
          ${this.hacs.localize("common.cancel")}
        </mwc-button>
        <mwc-button slot="primaryaction" @click=${this._reload}>
          ${this.hacs.localize("common.reload")}
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
