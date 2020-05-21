import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";
import memoizeOne from "memoize-one";

import {
  css,
  CSSResultArray,
  customElement,
  html,
  TemplateResult,
  property,
  PropertyValues,
} from "lit-element";

import {
  repositoryToggleBeta,
  repositoryInstall,
  getRepositories,
  repositoryInstallVersion,
} from "../../data/websocket";
import { HacsDialogBase } from "./hacs-dialog-base";
import { Repository } from "../../data/common";
import { repositoryUpdate } from "../../data/websocket";
import "./hacs-dialog";

@customElement("hacs-install-dialog")
export class HacsInstallDialog extends HacsDialogBase {
  @property() public repository?: string;
  @property() public _repository?: Repository;
  @property() private _toggle: boolean = true;

  shouldUpdate(changedProperties: PropertyValues) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "hass") {
        this.sidebarDocked =
          window.localStorage.getItem("dockedSidebar") === '"docked"';
      }
      if (propName === "repositories") {
        this._repository = this._getRepository(
          this.repositories,
          this.repository
        );
      }
    });
    return (
      changedProperties.has("sidebarDocked") ||
      changedProperties.has("narrow") ||
      changedProperties.has("active") ||
      changedProperties.has("_toggle") ||
      changedProperties.has("_repository")
    );
  }

  private _getRepository = memoizeOne(
    (repositories: Repository[], repository: string) =>
      repositories?.find((repo) => repo.id === repository)
  );

  protected async firstUpdated() {
    this._repository = this._getRepository(this.repositories, this.repository);
    if (!this._repository.updated_info) {
      await repositoryUpdate(this.hass, this._repository.id);
      this.repositories = await getRepositories(this.hass);
    }
    this._toggle = false;
  }

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
        .secondary=${this.secondary}
      >
        <div slot="header">${this._repository.name}</div>
        <div class="content">
          ${this._repository.version_or_commit === "version"
            ? html`<div class="beta-container">
                  <ha-switch
                    ?disabled=${this._toggle}
                    .checked=${this._repository.beta}
                    @change=${this._toggleBeta}
                    >Show beta versions</ha-switch
                  >
                </div>
                <div class="version-select-container">
                  <paper-dropdown-menu
                    ?disabled=${this._toggle}
                    class="version-select-dropdown"
                    label="Select version"
                  >
                    <paper-listbox
                      id="version"
                      class="version-select-list"
                      slot="dropdown-content"
                      selected="-1"
                    >
                      ${this._repository.releases.map((release) => {
                        return html`<paper-item
                          version="${release}"
                          class="version-select-item"
                          >${release}</paper-item
                        >`;
                      })}
                      ${this._repository.full_name === "hacs/integration" ||
                      this._repository.hide_default_branch
                        ? ""
                        : html`
                            <paper-item
                              version="${this._repository.default_branch}"
                              class="version-select-item"
                              >${this._repository.default_branch}</paper-item
                            >
                          `}
                    </paper-listbox>
                  </paper-dropdown-menu>
                </div>`
            : ""}
        </div>
        <div slot="actions">
          <mwc-button
            ?disabled=${this._toggle}
            @click=${this._installRepository}
            >Install</mwc-button
          >

          <hacs-link .url="https://github.com/${this._repository.full_name}"
            ><mwc-button>Repository</mwc-button></hacs-link
          >
        </div>
      </hacs-dialog>
    `;
  }

  private async _toggleBeta(): Promise<void> {
    this._toggle = true;
    await repositoryToggleBeta(this.hass, this.repository);
    this.repositories = await getRepositories(this.hass);
    this._toggle = false;
  }

  private async _installRepository(): Promise<void> {
    this.dispatchEvent(
      new Event("hacs-secondary-dialog-closed", {
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
    if (
      this._repository.version_or_commit !== "commit" &&
      this._repository.selected_tag !== this._repository.available_version
    ) {
      await repositoryInstallVersion(
        this.hass,
        this._repository.id,
        this._repository.available_version
      );
    } else {
      await repositoryInstall(this.hass, this._repository.id);
    }
  }

  static get styles(): CSSResultArray {
    return [
      css`
        .version-select-dropdown {
          width: 100%;
        }
        .content {
          padding: 32px 8px;
        }

        paper-menu-button {
          color: var(--secondary-text-color);
          padding: 0;
        }
        paper-item {
          cursor: pointer;
        }
        paper-item-body {
          opacity: var(--dark-primary-opacity);
        }
      `,
    ];
  }
}
