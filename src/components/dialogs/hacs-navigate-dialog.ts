import { css, customElement, html, internalProperty, property, TemplateResult } from "lit-element";
import { navigate } from "../../../homeassistant-frontend/src/common/navigate";
import "../../../homeassistant-frontend/src/components/ha-bar";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";

@customElement("hacs-navigate-dialog")
export class HacsNavigateDialog extends HacsDialogBase {
  @property() public path!: string;
  @internalProperty() private _progress: number = 0;
  protected async firstUpdated() {
    this._updateProgress();
  }
  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    return html`
      <hacs-dialog
        @closed=${this.closeDialog}
        .active=${this.active}
        .hass=${this.hass}
        title="Navigating away from HACS"
        >
        <div class="content">
          This takes you away from HACS and to another page, what you see on that page is not a part
          of HACS.
          </br></br>
          Redirect will happen automatically in 10 seconds, if you do not want to wait
          click the "GO NOW" button.
        </div>
        <ha-bar .value=${this._progress}></ha-bar>
        <mwc-button slot="primaryaction" @click=${this._navigate}>
          Go now
        </mwc-button>
      </hacs-dialog>
    `;
  }

  public closeDialog() {
    this.active = false;
  }

  private _updateProgress() {
    setTimeout(() => {
      if (!this.active) {
        return;
      }
      this._progress += 10;
      if (this._progress === 100) {
        this._navigate();
      } else {
        this._updateProgress();
      }
    }, 1000);
  }

  private _navigate() {
    if (this.active) {
      navigate(this, this.path);
    }
  }

  static get styles() {
    return [
      css`
        hacs-dialog {
          --hacs-dialog-max-width: 460px;
        }
      `,
    ];
  }
}
