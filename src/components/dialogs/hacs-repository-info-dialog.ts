import { mdiAccount, mdiArrowDownBold, mdiCube, mdiExclamationThick, mdiStar } from "@mdi/js";
import { css, customElement, html, property, PropertyValues, TemplateResult } from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import memoizeOne from "memoize-one";
import { Repository } from "../../data/common";
import { getRepositories, repositoryUpdate } from "../../data/websocket";
import { scrollBarStyle } from "../../styles/element-styles";
import { markdown } from "../../tools/markdown/markdown";
import "../hacs-chip";
import "../hacs-link";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";

@customElement("hacs-repository-info-dialog")
export class HacsRepositoryDialog extends HacsDialogBase {
  @property() public repository?: string;
  @property() public _repository?: Repository;

  private _getRepository = memoizeOne((repositories: Repository[], repository: string) =>
    repositories?.find((repo) => repo.id === repository)
  );

  private _getAuthors = memoizeOne((repository: Repository) => {
    const authors: string[] = [];
    if (!repository.authors) return authors;
    repository.authors.forEach((author) => authors.push(author.replace("@", "")));
    if (authors.length === 0) {
      const author = repository.full_name.split("/")[0];
      if (
        ["custom-cards", "custom-components", "home-assistant-community-themes"].includes(author)
      ) {
        return authors;
      }
      authors.push(author);
    }
    return authors;
  });

  shouldUpdate(changedProperties: PropertyValues) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "hass") {
        this.sidebarDocked = window.localStorage.getItem("dockedSidebar") === '"docked"';
      }
      if (propName === "repositories") {
        this._repository = this._getRepository(this.repositories, this.repository);
      }
    });
    return (
      changedProperties.has("sidebarDocked") ||
      changedProperties.has("narrow") ||
      changedProperties.has("active") ||
      changedProperties.has("_repository")
    );
  }

  protected async firstUpdated() {
    this._repository = this._getRepository(this.repositories, this.repository);
    if (!this._repository.updated_info) {
      await repositoryUpdate(this.hass, this._repository.id);
      this.repositories = await getRepositories(this.hass);
    }
  }

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const authors = this._getAuthors(this._repository);
    return html`
      <hacs-dialog
        .noActions=${this._repository.installed}
        .active=${this.active}
        .title=${this._repository.name || ""}
        .hass=${this.hass}
        ><div class=${classMap({ content: true, narrow: this.narrow })}>
          <div class="chips">
            ${this._repository.installed
              ? html`<hacs-chip
                  title="${this.hacs.localize("dialog_info.version_installed")}"
                  .icon=${mdiCube}
                  .value=${this._repository.installed_version}
                ></hacs-chip>`
              : ""}
            ${authors
              ? authors.map(
                  (author) => html`<hacs-chip
                    title="${this.hacs.localize("dialog_info.author")}"
                    .url="https://github.com/${author}"
                    .icon=${mdiAccount}
                    .value="@${author}"
                  ></hacs-chip>`
                )
              : ""}
            ${this._repository.downloads
              ? html` <hacs-chip
                  title="${this.hacs.localize("dialog_info.downloads")}"
                  .icon=${mdiArrowDownBold}
                  .value=${this._repository.downloads}
                ></hacs-chip>`
              : ""}
            <hacs-chip
              title="${this.hacs.localize("dialog_info.stars")}"
              .icon=${mdiStar}
              .value=${this._repository.stars}
            ></hacs-chip>
            <hacs-chip
              title="${this.hacs.localize("dialog_info.open_issues")}"
              .icon=${mdiExclamationThick}
              .value=${this._repository.issues}
              .url="https://github.com/${this._repository.full_name}/issues"
            ></hacs-chip>
          </div>
          ${this._repository.updated_info
            ? markdown.html(
                this._repository.additional_info || this.hacs.localize("dialog_info.no_info"),
                this._repository
              )
            : this.hacs.localize("dialog_info.loading")}
        </div>
        ${!this._repository.installed && this._repository.updated_info
          ? html`
              <mwc-button slot="primaryaction" @click=${this._installRepository}
                >${this.hacs.localize("dialog_info.install")}</mwc-button
              ><hacs-link
                slot="secondaryaction"
                .url="https://github.com/${this._repository.full_name}"
                ><mwc-button>${this.hacs.localize("dialog_info.open_repo")}</mwc-button></hacs-link
              >
            `
          : ""}
      </hacs-dialog>
    `;
  }
  static get styles() {
    return [
      scrollBarStyle,
      css`
        .content {
          width: 100%;
          overflow: auto;
          max-height: 870px;
        }
        .narrow {
          max-height: 480px;
          min-width: unset !important;
          width: 100% !important;
        }
        img {
          max-width: 100%;
        }
        .chips {
          display: flex;
          padding-bottom: 8px;
        }
        hacs-chip {
          margin: 0 4px;
        }
        div.chips hacs-link {
          margin: -24px 4px;
        }
        hacs-link mwc-button {
          margin-top: -18px;
        }
      `,
    ];
  }

  private async _installRepository(): Promise<void> {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog-secondary", {
        detail: {
          type: "install",
          repository: this._repository.id,
        },
        bubbles: true,
        composed: true,
      })
    );
  }
}
