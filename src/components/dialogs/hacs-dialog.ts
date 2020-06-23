import { css, customElement, html, TemplateResult, property } from "lit-element";
import { HacsDialogBase } from "./hacs-dialog-base";

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
      stacked
      ?hideActions=${this.hideActions}
      .heading=${createCloseHeading(this.hass, this.title)}
      @scroll=${() => console.log("scroll")}
    >
      <div class="content" @scroll=${() => console.log("scroll")}>
        <slot @scroll=${() => console.log("scroll")}></slot>
      </div>
      <slot name="primaryAction"></slot>
      <slot name="secondaryAction"></slot>
    </ha-dialog>`;
  }

  static get styles() {
    return css`
      ha-dialog {
        --mdc-dialog-max-width: var(--hacs-dialog-max-width, 990px);
        --mdc-dialog-min-width: var(--hacs-dialog-max-width, 280px);
      }
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
}
