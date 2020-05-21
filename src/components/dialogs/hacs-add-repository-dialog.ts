import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";
import memoizeOne from "memoize-one";
import {
  customElement,
  html,
  TemplateResult,
  css,
  property,
  PropertyValues,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import { HacsDialogBase } from "./hacs-dialog-base";
import { Repository } from "../../data/common";

import { localize } from "../../localize/localize";
import "../hacs-search";
import "../hacs-chip";

@customElement("hacs-add-repository-dialog")
export class HacsAddRepositoryDialog extends HacsDialogBase {
  @property() private _searchInput: string = "";

  shouldUpdate(changedProperties: PropertyValues) {
    return changedProperties.has("_searchInput");
  }

  private _repositoriesInActiveCategory = memoizeOne(
    (repositories: Repository[], categories: string[]) =>
      repositories.filter((repo) => categories.includes(repo.category))
  );

  private _filterRepositories = memoizeOne(
    (repositories: Repository[], filter: string) =>
      repositories.filter(
        (repo) =>
          repo.name.includes(filter) ||
          repo.description?.toLocaleLowerCase().includes(filter) ||
          repo.category.toLocaleLowerCase().includes(filter) ||
          repo.full_name.toLocaleLowerCase().includes(filter) ||
          String(repo.authors)?.toLocaleLowerCase().includes(filter) ||
          repo.domain?.toLocaleLowerCase().includes(filter)
      )
  );

  protected render(): TemplateResult | void {
    this._searchInput = window.localStorage.getItem("hacs-search");
    if (!this.active) return html``;

    const repositories = this._filterRepositories(
      this._repositoriesInActiveCategory(
        this.repositories,
        this.configuration?.categories
      ),
      this._searchInput.toLocaleLowerCase()
    );

    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
      >
        <div slot="header">Add repository</div>
        <div class=${classMap({ content: true, narrow: this.narrow })}>
          <hacs-search
            .input=${this._searchInput}
            @input=${this._inputValueChanged}
          ></hacs-search>
          <div class="list"></div>
          ${repositories
            .sort((a, b) => (a.last_updated > b.last_updated ? -1 : 1))
            .slice(0, 100)
            .map(
              (repo) => html`<paper-icon-item
                class=${classMap({ narrow: this.narrow })}
                @click=${() => this._openInformation(repo)}
              >
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
                <paper-item-body two-line
                  >${repo.name}
                  <div class="category-chip">
                    <hacs-chip
                      icon="hacs:hacs"
                      .value=${localize(`common.${repo.category}`)}
                    ></hacs-chip>
                  </div>
                  <div secondary>${repo.description}</div>
                </paper-item-body>
              </paper-icon-item>`
            )}
          ${repositories.length === 0
            ? html`<p>
                No repositories found matching your filter
              </p>`
            : repositories.length > 100
            ? html`<p>
                Only the first 100 repositories are shown, use the search to
                filter what you need
              </p>`
            : ""}
        </div>
      </hacs-dialog>
    `;
  }

  private _inputValueChanged(ev: any) {
    this._searchInput = ev.target.input;
    window.localStorage.setItem("hacs-search", this._searchInput);
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
    if (ev.target) {
      ev.target.outerHTML = `<ha-icon
    icon="mdi:github-circle"
    slot="item-icon"
  ></ha-icon>`;
    }
  }
  static get styles() {
    return css`
      .content {
        min-width: 500px;
      }
      .narrow {
        min-width: unset !important;
        width: 100%;
      }
      .list {
        margin-top: 16px;
      }
      .category-chip {
        position: absolute;
        top: 8px;
        right: 8px;
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

      paper-icon-item:focus {
        background-color: var(--divider-color);
      }

      paper-icon-item {
        cursor: pointer;
        padding: 2px 0;
      }

      paper-item-body {
        width: 100%;
        min-height: var(--paper-item-body-two-line-min-height, 72px);
        display: var(--layout-vertical_-_display);
        flex-direction: var(--layout-vertical_-_flex-direction);
        justify-content: var(--layout-center-justified_-_justify-content);
      }
      paper-icon-item.narrow {
        border-bottom: 1px solid var(--divider-color);
        padding: 8px 0;
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
