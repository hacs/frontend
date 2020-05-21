import {
  customElement,
  html,
  TemplateResult,
  property,
  PropertyValues,
  css,
} from "lit-element";
import memoizeOne from "memoize-one";

import { HacsDialogBase } from "./hacs-dialog-base";
import { Repository } from "../../data/common";
import { markdown } from "../../legacy/markdown/markdown";

import "../../components/hacs-chip";

import { repositoryUpdate, getRepositories } from "../../data/websocket";

@customElement("hacs-repository-info-dialog")
export class HacsRepositoryDialog extends HacsDialogBase {
  @property() public repository?: string;
  @property() public _repository?: Repository;

  private _getRepository = memoizeOne(
    (repositories: Repository[], repository: string) =>
      repositories?.find((repo) => repo.id === repository)
  );

  private _getAuthors = memoizeOne((repository: Repository) => {
    const authors: string[] = [];
    if (!repository.authors) return authors;
    repository.authors.forEach((author) =>
      authors.push(author.replace("@", ""))
    );
    return authors;
  });

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
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
        .secondary=${this.secondary}
      >
        <div slot="header">${this._repository.name || ""}</div>
        <div class="chips">
          ${authors
            ? authors.map(
                (author) => html`<hacs-link .url="https://github.com/${author}"
                  ><hacs-chip
                    title="Author"
                    icon="mdi:account"
                    .value="@${author}"
                  ></hacs-chip
                ></hacs-link>`
              )
            : ""}
          ${this._repository.downloads
            ? html` <hacs-chip
                title="Downloads"
                icon="mdi:arrow-down-bold"
                .value=${this._repository.downloads}
              ></hacs-chip>`
            : ""}
          <hacs-chip
            title="Stars"
            icon="mdi:star"
            .value=${this._repository.stars}
          ></hacs-chip>
          <hacs-link
            .url="https://github.com/${this._repository.full_name}/issues"
          >
            <hacs-chip
              title="Open issues"
              icon="mdi:exclamation-thick"
              .value=${this._repository.issues}
            ></hacs-chip
          ></hacs-link>
        </div>
        ${this._repository.updated_info
          ? markdown.html(
              this._repository.additional_info ||
                "The developer has not provided any more information for this repository",
              this._repository
            )
          : "Loading information..."}
        ${!this._repository.installed && this._repository.updated_info
          ? html` <div slot="actions">
              <mwc-button @click=${this._installRepository} raised
                >Install this repository in HACS</mwc-button
              ><hacs-link
                .url="https://github.com/${this._repository.full_name}"
                ><mwc-button>Open repository</mwc-button></hacs-link
              >
            </div>`
          : ""}
      </hacs-dialog>
    `;
  }
  static get styles() {
    return css`
      img {
        max-width: 100%;
      }
      .chips {
        margin: 0 -4px;
        display: flex;
        padding-bottom: 8px;
      }
      hacs-chip {
        margin: 0 4px;
      }
      div.chips hacs-link {
        margin: -17px 4px;
      }
    `;
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
