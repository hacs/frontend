import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";
import {
  customElement,
  html,
  TemplateResult,
  css,
  property,
} from "lit-element";
import { HacsDialogBase } from "./hacs-dialog-base";
import { Repository, sortRepositoriesByName } from "../../data/common";

import "../hacs-search";

@customElement("hacs-add-repository-dialog")
export class HacsAddRepositoryDialog extends HacsDialogBase {
  @property() private _searchInput: string = "";

  private _searchFilter(repo: Repository): boolean {
    const input = this._searchInput.toLocaleLowerCase();
    if (input === "") return true;
    if (repo.name.toLocaleLowerCase().includes(input)) return true;
    if (repo.description?.toLocaleLowerCase().includes(input)) return true;
    if (repo.category.toLocaleLowerCase().includes(input)) return true;
    if (repo.full_name.toLocaleLowerCase().includes(input)) return true;
    if (String(repo.authors)?.toLocaleLowerCase().includes(input)) return true;
    if (repo.domain?.toLocaleLowerCase().includes(input)) return true;
    return false;
  }

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const repositories = this.repositories?.filter(
      (repo) =>
        !repo.installed &&
        this.configuration.categories.includes(repo.category) &&
        this._searchFilter(repo)
    );
    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
      >
        <div slot="header">Add repository</div>
        <div class="content">
          <hacs-search
            .input=${this._searchInput}
            @input=${this._inputValueChanged}
          ></hacs-search>
          <div class="list"></div>
          ${sortRepositoriesByName(repositories)?.map(
            (repo) => html`<paper-icon-item
              @click=${() => this._openInformation(repo)}
            >
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
              >
            </paper-icon-item>`
          )}
        </div>
      </hacs-dialog>
    `;
  }

  private _inputValueChanged(ev: any) {
    this._searchInput = ev.target.input;
  }

  private _openInformation(repo) {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog-secondary", {
        detail: {
          type: "repository-info",
          repository: repo.id,
        },
        bubbles: true,
        composed: true,
      })
    );
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

      paper-icon-item {
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
