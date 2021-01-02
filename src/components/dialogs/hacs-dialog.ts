import { css, customElement, html, property, TemplateResult } from "lit-element";
import { createCloseHeading } from "../../../homeassistant-frontend/src/components/ha-dialog";
import { HacsStyles } from "../../styles//hacs-common-style";
import { hacsStyleDialog, scrollBarStyle } from "../../styles/element-styles";
import "../hacs-icon-button";
import { HacsDialogBase } from "./hacs-dialog-base";

@customElement("hacs-dialog")
export class HacsDialog extends HacsDialogBase {
  @property({ type: Boolean }) public hideActions: boolean = false;
  @property({ type: Boolean }) public scrimClickAction: boolean = false;
  @property({ type: Boolean }) public escapeKeyAction: boolean = false;
  @property({ type: Boolean }) public noClose: boolean = false;
  @property() public title!: string;

  protected render(): TemplateResult | void {
    if (!this.active) {
      return html``;
    }

    return html` <ha-dialog
      ?open=${this.active}
      ?scrimClickAction=${this.scrimClickAction}
      ?escapeKeyAction=${this.escapeKeyAction}
      @closed=${this.closeDialog}
      ?hideActions=${this.hideActions}
      .heading=${!this.noClose ? createCloseHeading(this.hass, this.title) : this.title}
    >
      <div class="content" ?narrow=${this.narrow}>
        <slot></slot>
      </div>
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
      hacsStyleDialog,
      scrollBarStyle,
      HacsStyles,
      css`
        .content {
          overflow: auto;
        }
        ha-dialog {
          --mdc-dialog-max-width: var(--hacs-dialog-max-width, 990px);
          --mdc-dialog-min-width: var(--hacs-dialog-min-width, 280px);
        }
        .primary {
          margin-left: 52px;
        }
      `,
    ];
  }
}
