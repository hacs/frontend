import { html, TemplateResult, PropertyValues } from "lit";
import { customElement } from "lit/decorators";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";
import { Repository } from "../../data/common";
import { property } from "lit/decorators";
import {
  repositoryUninstall,
  deleteResource,
  fetchResources,
} from "../../data/websocket";

@customElement("hacs-uninstall-dialog")
export class HacsUninstallDialog extends HacsDialogBase {
  @property() public repository: Repository;
  @property() private _uninstalling: boolean = false;

  shouldUpdate(changedProperties: PropertyValues) {
    return (
      changedProperties.has("active") ||
      changedProperties.has("_repository") ||
      changedProperties.has("_uninstalling")
    );
  }

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    return html`
      <hacs-dialog .active=${this.active} .hass=${this.hass} title=${this.hacs.localize("dialog.uninstall.title")}>
        <div class="content">
          ${this.hacs.localize("dialog.uninstall.message").replace("{name}", this.repository.name)}
        </div>
        <mwc-button slot="secondaryaction" @click=${this._close}>
          ${this.hacs.localize("common.cancel")}
        </mwc-button>
        <mwc-button slot="primaryaction" @click=${this._uninstall}>
          ${this._uninstalling
            ? html`<ha-circular-progress active></ha-circular-progress>`
            : this.hacs.localize("confirm.yes")}</mwc-button
        >
        </mwc-button>
      </hacs-dialog>
    `;
  }

  private async _uninstall() {
    this._uninstalling = true;
    if (this.repository.category === "plugin" && this.hacs.status.lovelace_mode !== "yaml") {
      const resources = await fetchResources(this.hass);
      resources
        .filter((resource) => resource.url === this._lovelaceUrl())
        .forEach((resource) => {
          deleteResource(this.hass, String(resource.id));
        });
    }
    await repositoryUninstall(this.hass, this.repository.id);
    this._uninstalling = false;
    this._close()
  }

  private _lovelaceUrl(): string {
    return `/hacsfiles/${this.repository?.full_name.split("/")[1]}/${this.repository?.file_name}`;
  }

  private _close() {
    this.active = false;
    this.dispatchEvent(
      new Event("hacs-dialog-closed", {
        bubbles: true,
        composed: true,
      })
    );
  }
}
