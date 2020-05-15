import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";
import {
  customElement,
  html,
  TemplateResult,
  css,
  property,
  query,
} from "lit-element";
import { HacsDialogBase } from "./hacs-dialog-base";

import {
  repositoryDelete,
  getRepositories,
  repositoryAdd,
} from "../../data/websocket";

@customElement("hacs-custom-repositories-dialog")
export class HacsCustomRepositoriesDialog extends HacsDialogBase {
  @property() private _inputRepository: string;
  @query("#add-input") private _addInput?: any;
  @query("#category") private _addCategoty?: any;

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const repositories = this.repositories?.filter((repo) => repo.custom);
    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
      >
        <div slot="header">Custom repositories</div>
        <div class="content">
          <div class="list"></div>
          ${repositories?.map(
            (repo) => html`<paper-icon-item>
              ${repo.category === "integration" && repo.domain
                ? html`
                    <img
                      src="https://brands.home-assistant.io/${repo.domain}/icon.png"
                      referrerpolicy="no-referrer"
                      @error=${this._onImageError}
                      @load=${this._onImageLoad}
                    />
                  `
                : html`<ha-icon
                    icon="mdi:github-circle"
                    slot="item-icon"
                  ></ha-icon>`}
              <paper-item-body three-line
                >${repo.name}
                <div secondary>${repo.description}</div>
                <div secondary>
                  Category: ${repo.category}
                </div></paper-item-body
              ><ha-icon-button
                class="delete"
                icon="mdi:delete"
                @click=${() => this._removeRepository(repo.id)}
              ></ha-icon-button>
            </paper-icon-item>`
          )}
          <div class="add">
            <input
              id="add-input"
              class="add-input"
              placeholder="Add custom repository"
              .value=${this._inputRepository || ""}
              @input=${this._inputValueChanged}
            />
          </div>
          <div class="add-actions">
            <paper-dropdown-menu class="category" label="Category">
              <paper-listbox
                id="category"
                slot="dropdown-content"
                selected="-1"
              >
                ${this.configuration.categories.map(
                  (category) => html`
                    <paper-item class="categoryitem" .category=${category}>
                      ${category}
                    </paper-item>
                  `
                )}
              </paper-listbox>
            </paper-dropdown-menu>
            <mwc-button raised @click=${this._addRepository}>add</mwc-button>
          </div>
        </div>
      </hacs-dialog>
    `;
  }

  private _inputValueChanged() {
    this._inputRepository = this._addInput?.value;
  }

  private async _addRepository() {
    const repository = this._inputRepository;
    const category = this._addCategoty?.selectedItem.category;
    if (!category || !repository) {
      return;
    }
    await repositoryAdd(this.hass, repository, category);
  }

  private async _removeRepository(repository: string) {
    await repositoryDelete(this.hass, repository);
    this.repositories = await getRepositories(this.hass);
    this.requestUpdate();
  }

  private _onImageLoad(ev) {
    ev.target.style.visibility = "initial";
  }

  private _onImageError(ev) {
    ev.target.outerHTML = `<ha-icon
      icon="mdi:github-circle"
      slot="item-icon"
    ></ha-icon>`;
  }
  static get styles() {
    return css`
      .content {
        min-width: 500px;
      }
      .list {
        margin-top: 16px;
      }
      ha-icon-button,
      ha-icon {
        color: var(--secondary-text-color);
      }
      ha-icon {
        --mdc-icon-size: 36px;
      }
      img {
        align-items: center;
        display: block;
        justify-content: center;
        margin-bottom: 16px;
        max-height: 36px;
        max-width: 36px;
        position: absolute;
      }
      .delete {
        cursor: pointer;
      }

      paper-item-body {
        width: 100%;
        min-height: var(--paper-item-body-two-line-min-height, 72px);
        display: var(--layout-vertical_-_display);
        flex-direction: var(--layout-vertical_-_flex-direction);
        justify-content: var(--layout-center-justified_-_justify-content);
      }
      paper-item-body div {
        font-size: 14px;
        color: var(--secondary-text-color);
      }
      .add {
        border-top: 1px solid var(--divider-color);
        margin-top: 32px;
      }
      .add-actions {
        justify-content: space-between;
      }
      .add,
      .add-actions {
        display: flex;
        align-items: center;
        font-size: 20px;
        height: 65px;
        background-color: var(--sidebar-background-color);
        border-bottom: 1px solid var(--divider-color);
        padding: 0 16px;
        box-sizing: border-box;
      }
      .add-input {
        width: calc(100% - 80px);
        height: 40px;
        border: 0;
        padding: 0 16px;
        font-size: initial;
        color: var(--sidebar-text-color);
        font-family: var(--paper-font-body1_-_font-family);
      }
      input:focus {
        outline-offset: 0;
        outline: 0;
      }
      input {
        background-color: var(--sidebar-background-color);
      }
      paper-dropdown-menu {
        width: 75%;
      }
    `;
  }
}
