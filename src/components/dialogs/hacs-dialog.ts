import { css, customElement, html, TemplateResult, property } from "lit-element";
import { HacsDialogBase } from "./hacs-dialog-base";
import { hacsStyleDialog, scrollBarStyle } from "../../styles/element-styles";
import { createCloseHeading } from "../../../homeassistant-frontend/src/components/ha-dialog";

import "../hacs-icon-button";

@customElement("hacs-dialog")
export class HacsDialog extends HacsDialogBase {
  @property({ type: Boolean }) public hideActions: boolean = false;
  @property() public title!: string;

  protected render(): TemplateResult | void {
    if (!this.active) {
      return html``;
    }

    return html` <ha-dialog
      open
      ?hideActions=${this.hideActions}
      .heading=${createCloseHeading(this.hass, this.title)}
    >
      <div class="content" ?narrow=${this.narrow}>
        <slot></slot>
      </div>
      <slot class="primary" name="primaryaction" slot="primaryAction"></slot>
      <slot class="secondary" name="secondaryaction" slot="secondaryAction"></slot>
    </ha-dialog>`;
  }

  static get styles() {
    return [
      hacsStyleDialog,
      scrollBarStyle,
      css`
        .content {
          overflow: auto;
        }
        ha-dialog {
          --mdc-dialog-max-width: var(--hacs-dialog-max-width, 990px);
          --mdc-dialog-min-width: var(--hacs-dialog-max-width, 280px);
        }
        .primary {
          margin-left: 52px;
        }
      `,
    ];
  }
}
