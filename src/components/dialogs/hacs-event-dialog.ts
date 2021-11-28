import { html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { HacsDialogBase } from "./hacs-dialog-base";

const DIALOG = {
  "add-repository": () => import("./hacs-add-repository-dialog"),
  "custom-repositories": () => import("./hacs-custom-repositories-dialog"),
  generic: () => import("./hacs-generic-dialog"),
  download: () => import("./hacs-download-dialog"),
  navigate: () => import("./hacs-navigate-dialog"),
  removed: () => import("./hacs-removed-dialog"),
  update: () => import("./hacs-update-dialog"),
  "repository-info": () => import("./hacs-repository-info-dialog"),
  progress: () => import("./hacs-progress-dialog"),
};

@customElement("hacs-event-dialog")
export class HacsEventDialog extends HacsDialogBase {
  @property({ attribute: false }) public params!: any;

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const dialog = this.params.type || "generic";
    DIALOG[dialog]();

    const el: any = document.createElement(`hacs-${dialog}-dialog`);
    el.active = true;
    el.hass = this.hass;
    el.hacs = this.hacs;
    el.narrow = this.narrow;
    el.secondary = this.secondary;
    el.route = this.route;

    if (this.params) {
      for (const [key, value] of Object.entries(this.params)) {
        el[key] = value;
      }
    }
    return html`${el}`;
  }
}
