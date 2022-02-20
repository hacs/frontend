import { css, html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { Repository } from "../../data/common";
import {
  deleteResource,
  fetchResources,
  getRemovedRepositories,
  repositoryIgnore,
  repositoryUninstall,
} from "../../data/websocket";
import { HacsStyles } from "../../styles/hacs-common-style";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";

@customElement("hacs-removed-dialog")
export class HacsRemovedDialog extends HacsDialogBase {
  @property({ attribute: false }) public repository!: Repository;

  @property({ type: Boolean }) private _updating = false;

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const removedrepo = this.hacs.removed.find((r) => r.repository === this.repository.full_name);
    return html`
      <hacs-dialog
        .active=${this.active}
        .hass=${this.hass}
        .title=${this.hacs.localize("entry.messages.removed_repository", {
          repository: this.repository.full_name,
        })}
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
        <mwc-button slot="secondaryaction" @click=${this._ignoreRepository}>
          ${this.hacs.localize("common.ignore")}
        </mwc-button>
        <mwc-button class="uninstall" slot="primaryaction" @click=${this._uninstallRepository}
          >${this._updating
            ? html`<ha-circular-progress active size="small"></ha-circular-progress>`
            : this.hacs.localize("common.remove")}</mwc-button
        >
      </hacs-dialog>
    `;
  }

  static get styles() {
    return [
      HacsStyles,
      css`
        .uninstall {
          --mdc-theme-primary: var(--hcv-color-error);
        }
      `,
    ];
  }

  private _lovelaceUrl(): string {
    return `/hacsfiles/${this.repository?.full_name.split("/")[1]}/${this.repository?.file_name}`;
  }

  private async _ignoreRepository(): Promise<void> {
    await repositoryIgnore(this.hass, this.repository.full_name);

    const removed = await getRemovedRepositories(this.hass);
    this.dispatchEvent(
      new CustomEvent("update-hacs", {
        detail: { removed },
        bubbles: true,
        composed: true,
      })
    );

    this.dispatchEvent(
      new Event("hacs-dialog-closed", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _uninstallRepository(): Promise<void> {
    this._updating = true;
    if (
      this.repository.category === "plugin" &&
      this.hacs.status &&
      this.hacs.status.lovelace_mode !== "yaml"
    ) {
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
}
