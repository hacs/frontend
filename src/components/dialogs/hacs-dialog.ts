import { css, html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { createCloseHeading } from "../../../homeassistant-frontend/src/components/ha-dialog";
import { HacsStyles } from "../../styles/hacs-common-style";
import { HacsDialogBase } from "./hacs-dialog-base";
import { haStyleDialog } from "../../../homeassistant-frontend/src/resources/styles";

@customElement("hacs-dialog")
export class HacsDialog extends HacsDialogBase {
  @property({ type: Boolean }) public hideActions = false;

  @property({ type: Boolean }) public scrimClickAction = false;

  @property({ type: Boolean }) public escapeKeyAction = false;

  @property({ type: Boolean }) public noClose = false;

  @property({ type: Boolean }) public maxWidth = false;

  @property() public title!: string;

  protected render(): TemplateResult | void {
    if (!this.active) {
      return html``;
    }

    return html`<ha-dialog
      ?maxWidth=${this.maxWidth}
      ?open=${this.active}
      ?scrimClickAction=${this.scrimClickAction}
      ?escapeKeyAction=${this.escapeKeyAction}
      @closed=${this.closeDialog}
      ?hideActions=${this.hideActions}
      .heading=${!this.noClose ? createCloseHeading(this.hass, this.title) : this.title}
    >
      <slot></slot>
      <slot class="primary" name="primaryaction" slot="primaryAction"></slot>
      <slot class="secondary" name="secondaryaction" slot="secondaryAction"></slot>
    </ha-dialog>`;
  }

  public closeDialog() {
    this.active = false;
    this.dispatchEvent(
      new CustomEvent("closed", {
        bubbles: true,
        composed: true,
      })
    );
  }

  static get styles() {
    return [
      haStyleDialog,
      HacsStyles,
      css`
        ha-dialog[maxWidth] {
          --mdc-dialog-max-width: calc(100vw - 32px);
        }
      `,
    ];
  }
}
