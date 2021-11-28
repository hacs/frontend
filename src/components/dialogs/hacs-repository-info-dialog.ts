import "../../../homeassistant-frontend/src/components/ha-chip";
import "../../../homeassistant-frontend/src/components/ha-circular-progress";
import "@material/mwc-button/mwc-button";
import { mdiAccount, mdiArrowDownBold, mdiCube, mdiExclamationThick, mdiStar } from "@mdi/js";
import { css, html, PropertyValues, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import memoizeOne from "memoize-one";
import { Repository } from "../../data/common";
import { getRepositories, repositoryUpdate } from "../../data/websocket";
import { markdown } from "../../tools/markdown/markdown";
import "../hacs-link";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";
import { HacsStyles } from "../../styles/hacs-common-style";

@customElement("hacs-repository-info-dialog")
export class HacsRepositoryDialog extends HacsDialogBase {
  @property() public repository?: string;

  @property({ attribute: false }) public _repository?: Repository;

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
      if (propName === "hacs") {
        this._repository = this._getRepository(this.hacs.repositories, this.repository!);
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
    this._repository = this._getRepository(this.hacs.repositories, this.repository!);
    if (!this._repository?.updated_info) {
      await repositoryUpdate(this.hass, this._repository!.id);
      const repositories = await getRepositories(this.hass);
      this.dispatchEvent(
        new CustomEvent("update-hacs", {
          detail: { repositories },
          bubbles: true,
          composed: true,
        })
      );
      this._repository = this._getRepository(repositories, this.repository!);
    }
  }

  protected render(): TemplateResult | void {
    if (!this.active || !this._repository) return html``;
    const authors = this._getAuthors(this._repository);
    return html`
      <hacs-dialog
        .hideActions=${this._repository.installed}
        .active=${this.active}
        .title=${this._repository.name || ""}
        .hass=${this.hass}
        maxWidth
      >
        <div class="content">
          <div class="chips">
            ${this._repository.installed
              ? html`
                  <ha-chip title="${this.hacs.localize("dialog_info.version_installed")}" hasIcon>
                    <ha-svg-icon slot="icon" .path=${mdiCube}></ha-svg-icon>
                    ${this._repository.installed_version}
                  </ha-chip>
                `
              : ""}
            ${authors
              ? authors.map(
                  (author) => html`<hacs-link .url="https://github.com/${author}">
                    <ha-chip title="${this.hacs.localize("dialog_info.author")}" hasIcon>
                      <ha-svg-icon slot="icon" .path=${mdiAccount}></ha-svg-icon>
                      @${author}
                    </ha-chip>
                  </hacs-link>`
                )
              : ""}
            ${this._repository.downloads
              ? html` <ha-chip hasIcon title="${this.hacs.localize("dialog_info.downloads")}">
                  <ha-svg-icon slot="icon" .path=${mdiArrowDownBold}></ha-svg-icon>
                  ${this._repository.downloads}
                </ha-chip>`
              : ""}
            <ha-chip title="${this.hacs.localize("dialog_info.stars")}" hasIcon>
              <ha-svg-icon slot="icon" .path=${mdiStar}></ha-svg-icon>
              ${this._repository.stars}
            </ha-chip>
            <hacs-link .url="https://github.com/${this._repository.full_name}/issues">
              <ha-chip title="${this.hacs.localize("dialog_info.open_issues")}" hasIcon>
                <ha-svg-icon slot="icon" .path=${mdiExclamationThick}></ha-svg-icon>
                ${this._repository.issues}
              </ha-chip>
            </hacs-link>
          </div>

          ${this._repository.updated_info
            ? markdown.html(
                this._repository.additional_info || this.hacs.localize("dialog_info.no_info"),
                this._repository
              )
            : html`
                <div class="loading">
                  <ha-circular-progress active size="large"></ha-circular-progress>
                </div>
              `}
        </div>
        ${!this._repository.installed && this._repository.updated_info
          ? html`
              <mwc-button slot="primaryaction" @click=${this._installRepository}>
                ${this.hacs.localize("dialog_info.download")}
              </mwc-button>
              <hacs-link
                slot="secondaryaction"
                .url="https://github.com/${this._repository.full_name}"
              >
                <mwc-button>${this.hacs.localize("dialog_info.open_repo")}</mwc-button>
              </hacs-link>
            `
          : ""}
      </hacs-dialog>
    `;
  }

  static get styles() {
    return [
      HacsStyles,
      css`
        img {
          max-width: 100%;
        }
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 8rem;
        }
        .chips {
          display: flex;
          flex-wrap: wrap;
          padding-bottom: 8px;
          gap: 4px;
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
          type: "download",
          repository: this._repository!.id,
        },
        bubbles: true,
        composed: true,
      })
    );
  }
}
