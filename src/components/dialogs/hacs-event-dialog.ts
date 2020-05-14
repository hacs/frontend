import { customElement, html, TemplateResult, property } from "lit-element";

import { HacsDialogBase } from "./hacs-dialog-base";
import "./hacs-generic-dialog";
import "./hacs-about-dialog";
import "./hacs-update-dialog";
import "./hacs-repository-info-dialog";

@customElement("hacs-event-dialog")
export class HacsEventDialog extends HacsDialogBase {
  @property({ attribute: false }) public params!: any;

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const el: any = document.createElement(
      `hacs-${this.params.type || "generic"}-dialog`
    );
    el.active = true;
    el.hass = this.hass;
    el.narrow = this.narrow;
    el.configuration = this.configuration;
    el.lovelace = this.lovelace;
    el.repositories = this.repositories;
    el.route = this.route;
    el.status = this.status;
    if (this.params) {
      for (let [key, value] of Object.entries(this.params)) {
        el[key] = value;
      }
    }
    return html`${el}`;
  }
}
