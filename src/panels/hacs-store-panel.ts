import { LitElement, customElement, property, html, css, TemplateResult } from "lit-element";
import memoizeOne from "memoize-one";

import { HomeAssistant } from "custom-card-helpers";
import { Route, Status, Configuration, Repository, LovelaceResource } from "../data/common";
import "../layout/hacs-tabbed-layout";
import "../components/hacs-repository-card";
import "../components/hacs-search";
import "../components/hacs-fab";
import "../components/hacs-tabbed-menu";
import { localize } from "../localize/localize";
import { HacsStyles } from "../styles/hacs-common-style";
import { sections } from "./hacs-sections";
import { addedToLovelace } from "../tools/added-to-lovelace";

@customElement("hacs-store-panel")
export class HacsStorePanel extends LitElement {
  @property() private _searchInput: string = "";
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public repositories!: Repository[];
  @property({ attribute: false }) public lovelace: LovelaceResource[];
  @property({ attribute: false }) public status: Status;
  @property() public section!: string;

  private _repositoriesInActiveSection = memoizeOne(
    (repositories: Repository[], sections: any, section: string) => {
      const installedRepositories: Repository[] = repositories?.filter(
        (repo) =>
          sections.panels
            .find((panel) => panel.id === section)
            .categories?.includes(repo.category) && repo.installed
      );
      const newRepositories: Repository[] = repositories?.filter(
        (repo) =>
          sections.panels
            .find((panel) => panel.id === section)
            .categories?.includes(repo.category) &&
          repo.new &&
          !repo.installed
      );
      return [installedRepositories || [], newRepositories || []];
    }
  );

  private _panelsEnabled = memoizeOne((sections: any, config: Configuration) => {
    return sections.panels.filter((panel) => {
      const categories = panel.categories;
      if (categories === undefined) return true;
      return categories.filter((c) => config?.categories.includes(c)).length !== 0;
    });
  });

  private get allRepositories(): Repository[] {
    const [installedRepositories, newRepositories] = this._repositoriesInActiveSection(
      this.repositories,
      sections,
      this.section
    );

    return newRepositories.concat(installedRepositories);
  }

  private get visibleRepositories(): Repository[] {
    return this.allRepositories.filter(
      (repo) => repo.name.toLowerCase().indexOf(this._searchInput.toLowerCase()) > -1
    );
  }

  protected render(): TemplateResult {
    const newRepositories = this._repositoriesInActiveSection(
      this.repositories,
      sections,
      this.section
    )[1];

    const tabs = this._panelsEnabled(sections, this.configuration);

    return html`<hacs-tabbed-layout
      .hass=${this.hass}
      .tabs=${tabs}
      .route=${this.route}
      .narrow=${this.narrow}
      .selected=${this.section}
      ><hacs-tabbed-menu
        slot="toolbar-icon"
        .hass=${this.hass}
        .route=${this.route}
        .narrow=${this.narrow}
        .configuration=${this.configuration}
        .lovelace=${this.lovelace}
        .status=${this.status}
        .repositories=${this.repositories}
      >
      </hacs-tabbed-menu>

      ${newRepositories?.length > 10
        ? html`<div class="new-repositories">
            ${localize("store.new_repositories_note")}
          </div>`
        : ""}

      <hacs-search .input=${this._searchInput} @input=${this._inputValueChanged}></hacs-search>
      <div class="content">
        ${this.allRepositories.length === 0
          ? this.renderEmpty()
          : this.visibleRepositories.length === 0
          ? this.renderNotFound()
          : this.renderRepositories()}
      </div>
      <hacs-fab
        .narrow=${this.narrow}
        @click=${this._addRepository}
        icon="mdi:plus"
        title="Add repository"
      >
      </hacs-fab>
    </hacs-tabbed-layout>`;
  }

  private renderRepositories(): TemplateResult[] {
    return this.visibleRepositories.map(
      (repo) =>
        html`<hacs-repository-card
          .hass=${this.hass}
          .repository=${repo}
          .narrow=${this.narrow}
          .status=${this.status}
          .addedToLovelace=${addedToLovelace(this.lovelace, this.configuration, repo)}
        ></hacs-repository-card>`
    );
  }

  private renderNotFound(): TemplateResult {
    return html`<ha-card class="no-repositories">
      <div class="header">${localize("store.no_repositories")} 😕</div>
      <p>
        ${localize("store.no_repositories_found_desc1").replace("{searchInput}", this._searchInput)}
        <br />
        ${localize("store.no_repositories_found_desc2")}
      </p>
    </ha-card>`;
  }

  private renderEmpty(): TemplateResult {
    return html`<ha-card class="no-repositories">
      <div class="header">${localize("store.no_repositories")} 😕</div>
      <p>
        ${localize("store.no_repositories_desc1")}<br />${localize("store.no_repositories_desc2")}
      </p>
    </ha-card>`;
  }

  private _inputValueChanged(ev: any) {
    this._searchInput = ev.target.input;
  }

  private _addRepository() {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "add-repository",
          repositories: this.repositories,
          section: this.section,
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
        hacs-repository-card {
          max-width: 500px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          grid-gap: 16px 16px;
          padding: 8px 16px 16px;
          margin-bottom: 64px;
        }
        .no-repositories {
          width: 100%;
          text-align: center;
          margin-top: 12px;
        }
        .new-repositories {
          margin: 4px 16px 0 16px;
        }
        paper-item {
          cursor: pointer;
        }
        ha-icon {
          color: var(--hcv-text-color-on-background);
        }
      `,
    ];
  }
}
