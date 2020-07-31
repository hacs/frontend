import { customElement, html, TemplateResult, property } from "lit-element";

import { Repository } from "../../data/common";
import { HacsDialogBase } from "./hacs-dialog-base";
import "./hacs-dialog";

@customElement("hacs-removed-dialog")
export class HacsRemovedDialog extends HacsDialogBase {
  @property({ attribute: false }) public repository: Repository;

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const removedrepo = this.hacs.removed.find((r) => r.repository !== this.repository.full_name);
    console.log(removedrepo);
    return html`
      <hacs-dialog
        .active=${this.active}
        .hass=${this.hass}
        .title=${this.hacs.localize("entry.messages.removed").replace("'{repository}'", "")}
      >
        <div class="content">
          <div><b>${this.hacs.localize("dialog_removed.name")}:</b> ${this.repository.name}</div>
          ${removedrepo.removal_type
            ? html` <div>
                <b>${this.hacs.localize("dialog_removed.type")}:</b> ${removedrepo.removal_type}
              </div>`
            : ""}
          ${removedrepo.reason
            ? html` <div>
                <b>${this.hacs.localize("dialog_removed.reason")}:</b> ${removedrepo.reason}
              </div>`
            : ""}
          ${removedrepo.link
            ? html`          <div>
            </b><hacs-link .url=${removedrepo.link}>${this.hacs.localize(
                "dialog_removed.link"
              )}</hacs-link>
          </div>`
            : ""}
        </div>
      </hacs-dialog>
    `;
  }
}
