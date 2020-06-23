import { customElement, html, TemplateResult, property } from "lit-element";
import { HacsDialogBase } from "./hacs-dialog-base";

import { createCloseHeading } from "../../../homeassistant-frontend/src/components/ha-dialog";

import "../hacs-icon-button";

@customElement("hacs-dialog")
export class HacsDialog extends HacsDialogBase {
  @property({ type: Boolean }) public stacked: boolean = false;
  @property() public title!: string;

  protected render(): TemplateResult | void {
    if (!this.active) {
      return html``;
    }

    return html` <ha-dialog
      open
      ?stacked=${this.stacked}
      .heading=${createCloseHeading(this.hass, this.title)}
    >
      <div class="content" @scroll=${this._scrollEvent}>
        <slot></slot>
      </div>
      <slot name="primaryAction"></slot>
      <slot name="secondaryAction"></slot>
    </ha-dialog>`;
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
