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
  Status,
  Configuration,
  Repository,
  LovelaceResource,
  sortRepositoriesByName,
} from "../data/common";
import "../layout/hacs-tabbed-layout";
import "../components/hacs-repository-card";
import "../components/hacs-search";
import "../components/hacs-tabbed-menu";

import { sections, panelEnabled } from "./hacs-sections";

@customElement("hacs-store-panel")
export class HacsStorePanel extends LitElement {
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public repositories!: Repository[];
  @property({ attribute: false }) public lovelace: LovelaceResource[];
  @property({ attribute: false }) public status: Status;
  @property() public section!: string;
  @property() public searchInput: string = "";

  private _filteredRepositories = () =>
    this.repositories?.filter(
      (repo) =>
        sections.panels
          .find((section) => section.id === this.section)
          .categories?.includes(repo.category) &&
        (repo.installed || repo.new)
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
    const repositories = sortRepositoriesByName(this._filteredRepositories());
    return html`<hacs-tabbed-layout
      .hass=${this.hass}
      .tabs=${sections.panels.filter((panel) => {
        return panelEnabled(panel.id, this.configuration);
      })}
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

      <div class="content">
        ${repositories
          ? repositories.map(
              (repo) =>
                html`<hacs-repository-card
                  .hass=${this.hass}
                  .repository=${repo}
                  .narrow=${this.narrow}
                  .status=${this.status}
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
