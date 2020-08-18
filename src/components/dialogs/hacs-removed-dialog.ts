import { customElement, html, TemplateResult, property, css } from "lit-element";

import { Repository } from "../../data/common";
import { HacsDialogBase } from "./hacs-dialog-base";
import { repositoryUninstall, deleteResource, fetchResources } from "../../data/websocket";
import "./hacs-dialog";

@customElement("hacs-removed-dialog")
export class HacsRemovedDialog extends HacsDialogBase {
  @property({ attribute: false }) public repository: Repository;
  @property({ type: Boolean }) private _updating: boolean = false;

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const removedrepo = this.hacs.removed.find((r) => r.repository === this.repository.full_name);
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
        <mwc-button class="uninstall" slot="primaryaction" @click=${this._uninstallRepository}
          >${this._updating
            ? html`<ha-circular-progress active></ha-circular-progress>`
            : this.hacs.localize("common.uninstall")}</mwc-button
        >
        <!--<mwc-button slot="secondaryaction" @click=${this._ignoreMessage}
          >${this.hacs.localize("common.ignore")}</mwc-button
        >-->
      </hacs-dialog>
    `;
  }

  static get styles() {
    return css`
      .uninstall {
        --mdc-theme-primary: var(--hcv-color-error);
      }
    `;
  }

  private _lovelaceUrl(): string {
    return `/hacsfiles/${this.repository?.full_name.split("/")[1]}/${this.repository?.file_name}`;
  }

  private async _uninstallRepository(): Promise<void> {
    this._updating = true;
    if (this.repository.category === "plugin" && this.hacs.status.lovelace_mode !== "yaml") {
      const resources = await fetchResources(this.hass);
      resources
        .filter((resource) => resource.url === this._lovelaceUrl())
        .forEach((resource) => {
          deleteResource(this.hass, String(resource.id));
        });
    }
    await repositoryUninstall(this.hass, this.repository.id);
    this._updating = false;
    this.active = false;
  }
  private async _ignoreMessage(): Promise<void> {
    this._updating = false;
    this.active = false;
  }
}
