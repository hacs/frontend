import {
  LitElement,
  customElement,
  property,
  html,
  css,
  TemplateResult,
} from "lit-element";
import "@material/mwc-fab";
import memoizeOne from "memoize-one";

import { HomeAssistant } from "custom-card-helpers";
import {
  Route,
  Status,
  Configuration,
  Repository,
  LovelaceResource,
} from "../data/common";
import "../layout/hacs-tabbed-layout";
import "../components/hacs-repository-card";
import "../components/hacs-search";
import "../components/hacs-tabbed-menu";

import { HacsCommonStyle } from "../styles/hacs-common-style";
import { sections } from "./hacs-sections";

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

  private _repositoriesInActiveSection = memoizeOne(
    (repositories: Repository[], sections: any, section: string) =>
      repositories?.filter(
        (repo) =>
          sections.panels
            .find((panel) => panel.id === section)
            .categories?.includes(repo.category) &&
          (repo.installed || repo.new)
      )
  );

  private _panelsEnabled = memoizeOne(
    (sections: any, config: Configuration) => {
      return sections.panels.filter((panel) => {
        const categories = panel.categories;
        if (categories === undefined) return true;
        return (
          categories.filter((c) => config?.categories.includes(c)).length !== 0
        );
      });
    }
  );

  protected render(): TemplateResult | void {
    const repositories = this._repositoriesInActiveSection(
      this.repositories,
      sections,
      this.section
    );

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

      <div class="content">
        ${repositories?.length !== 0
          ? repositories?.map(
              (repo) =>
                html`<hacs-repository-card
                  .hass=${this.hass}
                  .repository=${repo}
                  .narrow=${this.narrow}
                  .status=${this.status}
                ></hacs-repository-card>`
            )
          : html`<ha-card class="no-repositories">
              <div class="header">No repositories 😕</div>
              <p>
                It seems like you don't have any repositories installed in this
                section yet.<br />Click on the + in the bottom corner to add
                your first!
              </p>
            </ha-card>`}
      </div>
      <mwc-fab
        ?narrow="${this.narrow}"
        title="Add integration"
        @click=${this._addIntegration}
      >
        <ha-icon icon="mdi:plus"></ha-icon>
      </mwc-fab>
    </hacs-tabbed-layout>`;
  }

  private _addIntegration() {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "add-repository",
          repositories: this.repositories,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  static get styles() {
    return [
      HacsCommonStyle,
      css`
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
        .no-repositories {
          width: 100%;
          text-align: center;
          margin-top: 12px;
        }
        paper-item {
          cursor: pointer;
        }

        mwc-fab[narrow] {
          margin-bottom: 65px;
        }
        mwc-fab {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          width: 56px;
          height: 56px;
          fill: currentcolor;
          cursor: pointer;
          user-select: none;
          -webkit-appearance: none;
          background-color: var(--accent-color);
          color: var(--text-primary-color);
          box-shadow: var(
            --mdc-fab-box-shadow-active,
            0px 7px 8px -4px rgba(0, 0, 0, 0.2),
            0px 12px 17px 2px rgba(0, 0, 0, 0.14),
            0px 5px 22px 4px rgba(0, 0, 0, 0.12)
          );
          border-radius: 50%;
          --mdc-ripple-fg-opacity: 0.24;
          --mdc-ripple-fg-size: 32px;
          --mdc-ripple-fg-scale: 1.75;
          --mdc-ripple-left: 12px;
          --mdc-ripple-top: 12px;
        }
      `,
    ];
  }
}
