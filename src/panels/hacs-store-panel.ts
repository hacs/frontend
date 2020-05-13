import {
  LitElement,
  customElement,
  property,
  html,
  css,
  TemplateResult,
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";
import {
  Route,
  Configuration,
  Repository,
  LovelaceResource,
} from "../data/common";
import "../layout/hacs-tabbed-layout";
import "../components/hacs-repository-card";
import "../components/hacs-search";

import { sections } from "./hacs-sections";

@customElement("hacs-store-panel")
export class HacsStorePanel extends LitElement {
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public repositories!: Repository[];
  @property({ attribute: false }) public lovelace: LovelaceResource[];
  @property() public section!: string;
  @property() public searchInput: string = "";

  private _filteredRepositories = () =>
    this.repositories?.filter(
      (repo) =>
        sections.panels
          .find((section) => section.id === this.section)
          .categories?.includes(repo.category) && this._searchFilter(repo)
    );

  private _searchFilter(repo: Repository): boolean {
    const input = this.searchInput.toLocaleLowerCase();
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
    const repositories = this._filteredRepositories();
    return html`<hacs-tabbed-layout
      .hass=${this.hass}
      .tabs=${sections.panels}
      .route=${this.route}
      .selected=${this.section}
      ><paper-menu-button
        slot="toolbar-icon"
        horizontal-align="right"
        vertical-align="top"
        vertical-offset="40"
        close-on-activate
      >
        <ha-icon-button
          icon="hass:dots-vertical"
          slot="dropdown-trigger"
        ></ha-icon-button>
        <paper-listbox slot="dropdown-content">
          <paper-item class="pointer">About HACS</paper-item>
        </paper-listbox>
      </paper-menu-button>
      <hacs-search
        .input=${this.searchInput}
        @input=${this._inputValueChanged}
      ></hacs-search>
      <div class="content">
        ${repositories
          ? repositories.map(
              (repo) =>
                html`<hacs-repository-card
                  .repository=${repo}
                ></hacs-repository-card>`
            )
          : ""}
      </div>
    </hacs-tabbed-layout>`;
  }

  private _inputValueChanged(ev: any) {
    this.searchInput = ev.target.input;
  }

  static get styles() {
    return css`
      hacs-repository-card {
        max-width: 500px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        grid-gap: 16px 16px;
        padding: 8px 16px 16px;
        margin-bottom: 64px;
      }
      paper-item {
        cursor: pointer;
      }
    `;
  }
}
