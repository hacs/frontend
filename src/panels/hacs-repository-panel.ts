import {
  mdiAccount,
  mdiArrowDownBold,
  mdiCube,
  mdiDownload,
  mdiExclamationThick,
  mdiStar,
} from "@mdi/js";
import { css, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { mainWindow } from "../../homeassistant-frontend/src/common/dom/get_main_window";
import { extractSearchParamsObject } from "../../homeassistant-frontend/src/common/url/search-params";
import "../../homeassistant-frontend/src/components/ha-card";
import "../../homeassistant-frontend/src/components/ha-chip";
import "../../homeassistant-frontend/src/components/ha-fab";
import "../../homeassistant-frontend/src/components/ha-markdown";
import { showConfirmationDialog } from "../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import "../../homeassistant-frontend/src/layouts/hass-error-screen";
import "../../homeassistant-frontend/src/layouts/hass-loading-screen";
import "../../homeassistant-frontend/src/layouts/hass-subpage";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { repositoryMenuItems } from "../components/hacs-repository-owerflow-menu";
import { Hacs } from "../data/hacs";
import { fetchRepositoryInformation, RepositoryBase, RepositoryInfo } from "../data/repository";
import { getRepositories, repositoryAdd } from "../data/websocket";
import { HacsStyles } from "../styles/hacs-common-style";
import { markdownWithRepositoryContext } from "../tools/markdown";

@customElement("hacs-repository-panel")
export class HacsRepositoryPanel extends LitElement {
  @property({ attribute: false }) public hacs!: Hacs;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public narrow!: boolean;

  @property({ attribute: false }) public isWide!: boolean;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public _repository?: RepositoryInfo;

  @state() private _error?: string;

  public connectedCallback() {
    super.connectedCallback();
    document.body.addEventListener("keydown", this._generateMyLink);
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    document.body.removeEventListener("keydown", this._generateMyLink);
  }

  private _generateMyLink = (ev: KeyboardEvent) => {
    if (ev.ctrlKey || ev.shiftKey || ev.metaKey || ev.altKey) {
      // Ignore if modifier keys are pressed
      return;
    }
    if (ev.key === "m" && mainWindow.location.pathname.startsWith("/hacs/repository/")) {
      if (!this._repository) {
        return;
      }
      const myParams = new URLSearchParams({
        redirect: "hacs_repository",
        owner: this._repository!.full_name.split("/")[0],
        repository: this._repository!.full_name.split("/")[1],
        category: this._repository!.category,
      });
      window.open(`https://my.home-assistant.io/create-link/?${myParams.toString()}`, "_blank");
    }
  };

  protected async firstUpdated(changedProperties: PropertyValues): Promise<void> {
    super.firstUpdated(changedProperties);

    const params = extractSearchParamsObject();
    if (Object.entries(params).length) {
      let existing: RepositoryBase | undefined;
      const requestedRepository = `${params.owner}/${params.repository}`;
      existing = this.hacs.repositories.find(
        (repository) =>
          repository.full_name.toLocaleLowerCase() === requestedRepository.toLocaleLowerCase()
      );
      if (!existing && params.category) {
        if (
          !(await showConfirmationDialog(this, {
            title: this.hacs.localize("my.add_repository_title"),
            text: this.hacs.localize("my.add_repository_description", {
              repository: requestedRepository,
            }),
            confirmText: this.hacs.localize("common.add"),
            dismissText: this.hacs.localize("common.cancel"),
          }))
        ) {
          this._error = this.hacs.localize("my.repository_not_found", {
            repository: requestedRepository,
          });
          return;
        }
        try {
          await repositoryAdd(this.hass, requestedRepository, params.category);
          this.hacs.repositories = await getRepositories(this.hass);
          existing = this.hacs.repositories.find(
            (repository) =>
              repository.full_name.toLocaleLowerCase() === requestedRepository.toLocaleLowerCase()
          );
        } catch (err: any) {
          this._error = err;
          return;
        }
      }
      if (existing) {
        this._fetchRepository(String(existing.id));
      } else {
        this._error = this.hacs.localize("my.repository_not_found", {
          repository: requestedRepository,
        });
      }
    } else {
      const dividerPos = this.route.path.indexOf("/", 1);
      const repositoryId = this.route.path.substr(dividerPos + 1);
      if (!repositoryId) {
        this._error = "Missing repositoryId from route";
        return;
      }
      this._fetchRepository(repositoryId);
    }
  }

  protected updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has("repositories") && this._repository) {
      this._fetchRepository();
    }
  }

  private async _fetchRepository(repositoryId?: string) {
    try {
      this._repository = await fetchRepositoryInformation(
        this.hass,
        repositoryId || String(this._repository!.id)
      );
    } catch (err: any) {
      this._error = err?.message;
    }
  }

  private _getAuthors = memoizeOne((repository: RepositoryInfo) => {
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

  protected render(): TemplateResult {
    if (this._error) {
      return html`<hass-error-screen .error=${this._error}></hass-error-screen>`;
    }

    if (!this._repository) {
      return html`<hass-loading-screen></hass-loading-screen>`;
    }

    const authors = this._getAuthors(this._repository);

    return html`
      <hass-subpage
        .hass=${this.hass}
        .narrow=${this.narrow}
        .route=${this.route}
        .header=${this._repository.name}
        hasFab
      >
        <ha-icon-overflow-menu
          .hass=${this.hass}
          slot="toolbar-icon"
          narrow
          .items=${repositoryMenuItems(this, this._repository)}
        >
        </ha-icon-overflow-menu>
        <div class="content">
          <ha-card>
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
                    (author) => html`<a
                      href="https://github.com/${author}"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <ha-chip title="${this.hacs.localize("dialog_info.author")}" hasIcon>
                        <ha-svg-icon slot="icon" .path=${mdiAccount}></ha-svg-icon>
                        @${author}
                      </ha-chip>
                    </a>`
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
              <a
                href="https://github.com/${this._repository.full_name}/issues"
                target="_blank"
                rel="noreferrer noopener"
              >
                <ha-chip title="${this.hacs.localize("dialog_info.open_issues")}" hasIcon>
                  <ha-svg-icon slot="icon" .path=${mdiExclamationThick}></ha-svg-icon>
                  ${this._repository.issues}
                </ha-chip>
              </a>
            </div>
            <ha-markdown
              breaks
              .content=${markdownWithRepositoryContext(
                this._repository.additional_info,
                this._repository
              ) || this.hacs.localize("dialog_info.no_info")}
            ></ha-markdown>
          </ha-card>
        </div>

        ${!this._repository.installed_version
          ? html`<ha-fab
              .label=${this.hacs.localize("common.download")}
              .extended=${!this.narrow}
              @click=${this._downloadRepositoryDialog}
            >
              <ha-svg-icon slot="icon" .path=${mdiDownload}></ha-svg-icon>
            </ha-fab>`
          : ""}
      </hass-subpage>
    `;
  }

  private _downloadRepositoryDialog() {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "download",
          repository: this._repository!.id,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  static get styles() {
    return [
      HacsStyles,
      css`
        hass-loading-screen {
          --app-header-background-color: var(--sidebar-background-color);
          --app-header-text-color: var(--sidebar-text-color);
          height: 100vh;
        }

        hass-subpage {
          position: absolute;
          width: 100vw;
        }

        ha-svg-icon {
          color: var(--hcv-text-color-on-background);
        }

        ha-fab {
          position: fixed;
          float: right;
          right: calc(18px + env(safe-area-inset-right));
          bottom: calc(16px + env(safe-area-inset-bottom));
          z-index: 1;
        }

        ha-fab.rtl {
          float: left;
          right: auto;
          left: calc(18px + env(safe-area-inset-left));
        }

        ha-card {
          display: block;
          padding: 16px;
        }
        .content {
          margin: auto;
          padding: 8px;
          max-width: 1536px;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          padding-bottom: 8px;
          gap: 4px;
        }

        @media all and (max-width: 500px) {
          .content {
            margin: 8px 4px 64px;
            max-width: none;
          }
        }
      `,
    ];
  }
}
