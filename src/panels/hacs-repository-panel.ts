import {
  mdiAccount,
  mdiAlert,
  mdiAlertCircleOutline,
  mdiArrowDownBold,
  mdiArrowDownCircle,
  mdiClose,
  mdiCube,
  mdiDownload,
  mdiExclamationThick,
  mdiGithub,
  mdiLanguageJavascript,
  mdiReload,
  mdiStar,
} from "@mdi/js";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import { css, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { mainWindow } from "../../homeassistant-frontend/src/common/dom/get_main_window";
import { navigate } from "../../homeassistant-frontend/src/common/navigate";
import { extractSearchParamsObject } from "../../homeassistant-frontend/src/common/url/search-params";
import "../../homeassistant-frontend/src/components/ha-fab";
import "../../homeassistant-frontend/src/components/ha-icon-overflow-menu";
import { getConfigEntries } from "../../homeassistant-frontend/src/data/config_entries";
import { showConfirmationDialog } from "../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import "../../homeassistant-frontend/src/layouts/hass-error-screen";
import "../../homeassistant-frontend/src/layouts/hass-loading-screen";
import "../../homeassistant-frontend/src/layouts/hass-subpage";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import "../components/hacs-filter";
import "../components/hacs-repository-card";
import { Hacs } from "../data/hacs";
import { fetchRepositoryInformation, RepositoryBase, RepositoryInfo } from "../data/repository";
import {
  deleteResource,
  fetchResources,
  getRepositories,
  repositoryAdd,
  repositoryUninstall,
  repositoryUpdate,
} from "../data/websocket";
import { HacsStyles } from "../styles/hacs-common-style";
import { markdown } from "../tools/markdown/markdown";

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
          slot="toolbar-icon"
          narrow
          .hass=${this.hass}
          .items=${[
            {
              path: mdiGithub,
              label: this.hacs.localize("common.repository"),
              action: () =>
                mainWindow.open(
                  `https://github.com/${this._repository!.full_name}`,
                  "_blank",
                  "noreferrer=true"
                ),
            },
            {
              path: mdiArrowDownCircle,
              label: this.hacs.localize("repository_card.update_information"),
              action: () => this._refreshReopsitoryInfo(),
            },
            {
              path: mdiReload,
              label: this.hacs.localize("repository_card.redownload"),
              action: () => this._downloadRepositoryDialog(),
              hideForUninstalled: true,
            },
            {
              category: "plugin",
              hideForUninstalled: true,
              path: mdiLanguageJavascript,
              label: this.hacs.localize("repository_card.open_source"),
              action: () =>
                mainWindow.open(
                  `/hacsfiles/${this._repository!.local_path.split("/").pop()}/${
                    this._repository!.file_name
                  }`,
                  "_blank",
                  "noreferrer=true"
                ),
            },
            {
              path: mdiAlertCircleOutline,
              label: this.hacs.localize("repository_card.open_issue"),
              action: () =>
                mainWindow.open(
                  `https://github.com/${this._repository!.full_name}/issues`,
                  "_blank",
                  "noreferrer=true"
                ),
            },
            {
              hideForId: "172733314",
              path: mdiAlert,
              label: this.hacs.localize("repository_card.report"),
              hideForUninstalled: true,
              action: () =>
                mainWindow.open(
                  `https://github.com/hacs/integration/issues/new?assignees=ludeeus&labels=flag&template=removal.yml&repo=${
                    this._repository!.full_name
                  }&title=Request for removal of ${this._repository!.full_name}`,
                  "_blank",
                  "noreferrer=true"
                ),
            },
            {
              hideForId: "172733314",
              hideForUninstalled: true,
              path: mdiClose,
              label: this.hacs.localize("common.remove"),
              action: () => this._removeRepositoryDialog(),
            },
          ].filter(
            (entry) =>
              (!entry.category || this._repository!.category === entry.category) &&
              (!entry.hideForId || String(this._repository!.id) !== entry.hideForId) &&
              (!entry.hideForUninstalled || this._repository!.installed_version)
          )}
        >
        </ha-icon-overflow-menu>
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
          ${markdown.html(
            this._repository.additional_info || this.hacs.localize("dialog_info.no_info"),
            this._repository
          )}
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

  private async _removeRepositoryDialog() {
    if (this._repository!.category === "integration" && this._repository!.config_flow) {
      const configFlows = (await getConfigEntries(this.hass)).some(
        (entry) => entry.domain === this._repository!.domain
      );
      if (configFlows) {
        const ignore = await showConfirmationDialog(this, {
          title: this.hacs.localize("dialog.configured.title"),
          text: this.hacs.localize("dialog.configured.message", { name: this._repository!.name }),
          dismissText: this.hacs.localize("common.ignore"),
          confirmText: this.hacs.localize("common.navigate"),
          confirm: () => {
            navigate("/config/integrations", { replace: true });
          },
        });
        if (ignore) {
          return;
        }
      }
    }
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "progress",
          title: this.hacs.localize("dialog.remove.title"),
          confirmText: this.hacs.localize("dialog.remove.title"),
          content: this.hacs.localize("dialog.remove.message", { name: this._repository!.name }),
          confirm: async () => {
            await this._repositoryRemove();
          },
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _repositoryRemove() {
    if (this._repository!.category === "plugin" && this.hacs.info?.lovelace_mode !== "yaml") {
      const resources = await fetchResources(this.hass);
      resources
        .filter((resource) =>
          resource.url.startsWith(
            `/hacsfiles/${this._repository!.full_name.split("/")[1]}/${this._repository!.file_name}`
          )
        )
        .forEach(async (resource) => {
          await deleteResource(this.hass, String(resource.id));
        });
    }
    await repositoryUninstall(this.hass, String(this._repository!.id));
    history.back();
  }

  private async _refreshReopsitoryInfo() {
    await repositoryUpdate(this.hass, String(this._repository!.id));
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

        .content {
          padding: 12px;
          margin-bottom: 64px;
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
          }
        }
      `,
    ];
  }
}
