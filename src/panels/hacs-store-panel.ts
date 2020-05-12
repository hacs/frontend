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

  private _filteredRepositories = () =>
    this.repositories?.filter((repo) =>
      sections.panels
        .find((section) => section.id === this.section)
        .categories?.includes(repo.category)
    );

  protected render(): TemplateResult | void {
    console.log("render hacs-store-panel");
    const repositories = this._filteredRepositories();
    return html`<hacs-tabbed-layout
      .hass=${this.hass}
      .tabs=${sections.panels}
      .route=${this.route}
      .selected=${this.section}
    >
      <div class="content">
        ${repositories?.map(
          (repo) =>
            html`<hacs-repository-card
              .repository=${repo}
            ></hacs-repository-card>`
        )}
      </div>
    </hacs-tabbed-layout>`;
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
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        grid-gap: 16px 16px;
        padding: 8px 16px 16px;
        margin-bottom: 64px;
      }
    `;
  }
}
