import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";
import {
  customElement,
  html,
  TemplateResult,
  css,
  property,
  query,
  PropertyValues,
} from "lit-element";
import { HacsDialogBase } from "./hacs-dialog-base";

import {
  repositoryDelete,
  getRepositories,
  repositoryAdd,
} from "../../data/websocket";

import { localize } from "../../localize/localize";

@customElement("hacs-custom-repositories-dialog")
export class HacsCustomRepositoriesDialog extends HacsDialogBase {
  @property() private _inputRepository: string;
  @property() private _error: any;
  @query("#add-input") private _addInput?: any;
  @query("#category") private _addCategory?: any;

  shouldUpdate(changedProperties: PropertyValues) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "hass") {
        this.sidebarDocked =
          window.localStorage.getItem("dockedSidebar") === '"docked"';
      }
    });
    return (
      changedProperties.has("sidebarDocked") ||
      changedProperties.has("narrow") ||
      changedProperties.has("active") ||
      changedProperties.has("_error") ||
      changedProperties.has("repositories")
    );
  }

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const repositories = this.repositories?.filter((repo) => repo.custom);
    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
        noActions
        dynamicHeight
      >
        <div slot="header">${localize("dialog_custom_repositories.title")}</div>
        <div class="content">
          ${this._error
            ? html`<div class="error">${this._error.message}</div>`
            : ""}
          <div class="list">
            ${repositories?.map(
              (repo) => html`<paper-icon-item>
                ${repo.category === "integration"
                  ? html`
                      <img
                        src="https://brands.home-assistant.io/_/${repo.domain}/icon.png"
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
          </div>
          <div class="add">
            <input
              id="add-input"
              class="add-input"
              placeholder="${localize(
                "dialog_custom_repositories.url_placeholder"
              )}"
              .value=${this._inputRepository || ""}
              @input=${this._inputValueChanged}
            />
          </div>
          <div class="add-actions">
            <paper-dropdown-menu
              class="category"
              label="${localize("dialog_custom_repositories.category")}"
            >
              <paper-listbox
                id="category"
                slot="dropdown-content"
                selected="-1"
              >
                ${this.configuration.categories.map(
                  (category) => html`
                    <paper-item class="categoryitem" .category=${category}>
                      ${localize(`common.${category}`)}
                    </paper-item>
                  `
                )}
              </paper-listbox>
            </paper-dropdown-menu>
            <mwc-button raised @click=${this._addRepository}
              >${localize("common.add")}</mwc-button
            >
          </div>
        </div>
      </hacs-dialog>
    `;
  }

  protected firstUpdated() {
    this.hass.connection.subscribeEvents(
      (msg) => (this._error = (msg as any).data),
      "hacs/error"
    );
  }

  private _inputValueChanged() {
    this._inputRepository = this._addInput?.value;
  }

  private async _addRepository() {
    this._error = undefined;
    const repository = this._inputRepository;
    const category = this._addCategory?.selectedItem?.category;
    if (!category) {
      this._error = {
        message: localize("dialog_custom_repositories.no_category"),
      };
      return;
    }
    if (!repository) {
      this._error = {
        message: localize("dialog_custom_repositories.no_repository"),
      };
      return;
    }
    await repositoryAdd(this.hass, repository, category);
    this.repositories = await getRepositories(this.hass);
  }

  private async _removeRepository(repository: string) {
    this._error = undefined;
    await repositoryDelete(this.hass, repository);
    this.repositories = await getRepositories(this.hass);
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
        width: 1024px;
        display: contents;
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
      .error {
        line-height: 0px;
        margin: 12px;
        color: var(--hacs-error-color, var(--google-red-500));
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
