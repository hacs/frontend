import "../../../homeassistant-frontend/src/components/ha-alert";
import "@material/mwc-button/mwc-button";
import "@polymer/paper-item/paper-item";
import { mdiDelete, mdiGithub } from "@mdi/js";
import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";
import "@polymer/paper-listbox/paper-listbox";
import { css, html, PropertyValues, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators";
import "../../../homeassistant-frontend/src/components/ha-svg-icon";
import "../../../homeassistant-frontend/src/components/ha-paper-dropdown-menu";
import { getRepositories, repositoryAdd, repositoryDelete } from "../../data/websocket";
import { hacsIconStyle, scrollBarStyle } from "../../styles/element-styles";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";
import { brandsUrl } from "../../../homeassistant-frontend/src/util/brands-url";
import { computeRTL } from "../../../homeassistant-frontend/src/common/util/compute_rtl";

@customElement("hacs-custom-repositories-dialog")
export class HacsCustomRepositoriesDialog extends HacsDialogBase {
  @property() private _inputRepository?: string;

  @property() private _error: any;

  @query("#add-input") private _addInput?: any;

  @query("#category") private _addCategory?: any;

  shouldUpdate(changedProperties: PropertyValues) {
    return (
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
        .hass=${this.hass}
        .title=${this.hacs.localize("dialog_custom_repositories.title")}
        hideActions
      >
        <div class="content">
          <div class="list">
            ${this._error?.message
              ? html`<ha-alert alert-type="error" .rtl=${computeRTL(this.hass)}>
                  ${this._error.message}
                </ha-alert>`
              : ""}
            ${repositories
              ?.filter((repo) => this.hacs.configuration.categories.includes(repo.category))
              .map(
                (repo) => html`<paper-icon-item>
                  ${repo.category === "integration"
                    ? html`
                        <img
                          loading="lazy"
                          .src=${brandsUrl({
                            domain: repo.domain,
                            darkOptimized: this.hass.themes.darkMode,
                            type: "icon",
                          })}
                          referrerpolicy="no-referrer"
                          @error=${this._onImageError}
                          @load=${this._onImageLoad}
                        />
                      `
                    : html`<ha-svg-icon .path=${mdiGithub} slot="item-icon"></ha-svg-icon>`}
                  <paper-item-body
                    @click=${() => this._showReopsitoryInfo(String(repo.id))}
                    three-line
                    >${repo.name}
                    <div secondary>${repo.description}</div>
                    <div secondary>Category: ${repo.category}</div></paper-item-body
                  >
                  <mwc-icon-button @click=${() => this._removeRepository(repo.id)}>
                    <ha-svg-icon class="delete" .path=${mdiDelete}></ha-svg-icon>
                  </mwc-icon-button>
                </paper-icon-item>`
              )}
          </div>
        </div>
        <div class="add-repository" ?narrow=${this.narrow}>
          <input
            id="add-input"
            class="add-input"
            slot="secondaryaction"
            placeholder="${this.hacs.localize("dialog_custom_repositories.url_placeholder")}"
            .value=${this._inputRepository || ""}
            @input=${this._inputValueChanged}
            ?narrow=${this.narrow}
          />

          <ha-paper-dropdown-menu
            ?narrow=${this.narrow}
            class="category"
            label="${this.hacs.localize("dialog_custom_repositories.category")}"
          >
            <paper-listbox id="category" slot="dropdown-content" selected="-1">
              ${this.hacs.configuration.categories.map(
                (category) => html`
                  <paper-item class="categoryitem" .category=${category}>
                    ${this.hacs.localize(`common.${category}`)}
                  </paper-item>
                `
              )}
            </paper-listbox>
          </ha-paper-dropdown-menu>
          <mwc-button
            ?narrow=${this.narrow}
            slot="primaryaction"
            raised
            @click=${this._addRepository}
          >
            ${this.hacs.localize("common.add")}
          </mwc-button>
        </div>
      </hacs-dialog>
    `;
  }

  protected firstUpdated() {
    this.hass.connection.subscribeEvents((msg) => (this._error = (msg as any).data), "hacs/error");
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
        message: this.hacs.localize("dialog_custom_repositories.no_category"),
      };
      return;
    }
    if (!repository) {
      this._error = {
        message: this.hacs.localize("dialog_custom_repositories.no_repository"),
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
    if (ev.target) {
      ev.target.outerHTML = `<ha-svg-icon path="${mdiGithub}" slot="item-icon"></ha-svg-icon>`;
    }
  }

  private async _showReopsitoryInfo(repository: string) {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog-secondary", {
        detail: {
          type: "repository-info",
          repository,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  static get styles() {
    return [
      scrollBarStyle,
      hacsIconStyle,
      css`
        .content {
          width: 1024px;
          display: contents;
        }
        .list {
          position: relative;
          margin-top: 16px;
          max-height: 870px;
          overflow: auto;
        }
        ha-svg-icon {
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
          color: var(--hacs-error-color, var(--google-red-500));
        }
        paper-item-body {
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
        .add-repository {
          display: grid;
          width: 100%;
          justify-items: right;
        }

        .add-input {
          width: 100%;
          height: 40px;
          margin-top: 32px;
          border: 0;
          border-bottom: 1px var(--mdc-theme-primary) solid;
          text-align: left;
          padding: 0px;
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
        ha-paper-dropdown-menu {
          width: 100%;
        }
        mwc-button {
          width: fit-content;
          margin-top: 16px;
        }

        input[narrow],
        .add-repository[narrow],
        ha-paper-dropdown-menu[narrow],
        mwc-button[narrow] {
          margin: 0;
          padding: 0;
          left: 0;
          top: 0;
          width: 100%;
          max-width: 100%;
        }
        .add-repository[narrow] {
          display: contents;
        }
      `,
    ];
  }
}
