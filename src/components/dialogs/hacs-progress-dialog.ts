import "@material/mwc-button/mwc-button";
import "../../../homeassistant-frontend/src/components/ha-circular-progress";
import { html, TemplateResult, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";

@customElement("hacs-progress-dialog")
export class HacsProgressDialog extends HacsDialogBase {
  @property() public title!: string;

  @property() public content?: string;

  @property() public confirmText?: string;

  @property() public confirm!: () => Promise<void>;

  @property({ type: Boolean }) private _inProgress = false;

  shouldUpdate(changedProperties: PropertyValues) {
    return (
      changedProperties.has("active") ||
      changedProperties.has("title") ||
      changedProperties.has("content") ||
      changedProperties.has("confirmText") ||
      changedProperties.has("confirm") ||
      changedProperties.has("_inProgress")
    );
  }

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    return html`
      <hacs-dialog .active=${this.active} .hass=${this.hass} title=${this.title || ""}>
        <div class="content">
          ${this.content || ""}
        </div>
        <mwc-button slot="secondaryaction" ?disabled=${this._inProgress} @click=${this._close}>
          ${this.hacs.localize("common.cancel")}
        </mwc-button>
        <mwc-button slot="primaryaction" @click=${this._confirmed}>
          ${
            this._inProgress
              ? html`<ha-circular-progress active size="small"></ha-circular-progress>`
              : this.confirmText || this.hacs.localize("common.yes")
          }</mwc-button
          >
        </mwc-button>
      </hacs-dialog>
    `;
  }

  private async _confirmed() {
    this._inProgress = true;
    await this.confirm();
    this._inProgress = false;
    this._close();
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
