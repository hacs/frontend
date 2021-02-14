import { mdiPlus } from "@mdi/js";
import { css, customElement, html, LitElement, property, TemplateResult } from "lit-element";
import memoizeOne from "memoize-one";
import "../../homeassistant-frontend/src/common/search/search-input";
import "../../homeassistant-frontend/src/components/ha-card";
import "../../homeassistant-frontend/src/components/ha-fab";
import "../../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import "../components/hacs-fab";
import "../components/hacs-filter";
import "../components/hacs-repository-card";
import "../components/hacs-tabbed-menu";
import { Repository } from "../data/common";
import { Hacs } from "../data/hacs";
import { fabStyles, hassTabsSubpage, scrollBarStyle, searchStyles } from "../styles/element-styles";
import { HacsStyles } from "../styles/hacs-common-style";
import { filterRepositoriesByInput } from "../tools/filter-repositories-by-input";

@customElement("hacs-store-panel")
export class HacsStorePanel extends LitElement {
  @property({ attribute: false }) public filters: any = {};
  @property({ attribute: false }) public hacs?: Hacs;
  @property() private _searchInput: string = "";
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public isWide!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public sections!: any;
  @property() public section!: string;

  private _repositoriesInActiveSection = memoizeOne(
    (repositories: Repository[], section: string) => {
      let activeRepositories: Repository[] = [];
      if (section.split("/")[1] === "installed") {
        activeRepositories = repositories?.filter((repo) => repo.installed);
      } else if (section.split("/")[1] === "new") {
        activeRepositories = repositories?.filter((repo) => !repo.installed && repo.new);
      } else {
        activeRepositories = repositories?.filter(
          (repo) => repo.category === section.split("/")[1]
        );
      }
      return activeRepositories;
    }
  );

  private _filterRepositories = memoizeOne(filterRepositoriesByInput);

  private get visibleRepositories(): Repository[] {
    return this._filterRepositories(
      this._repositoriesInActiveSection(this.hacs.repositories, this.section),
      this._searchInput
    );
  }

  protected render(): TemplateResult {
    if (!this.hacs) {
      return html``;
    }

    return html`<hass-tabs-subpage
      back-path="/hacs/entry"
      .hass=${this.hass}
      .narrow=${this.narrow}
      .route=${this.route}
      .tabs=${this.hacs.sections[this.section.split("/")[0]]}
      hasFab
    >
      <hacs-tabbed-menu
        slot="toolbar-icon"
        .hass=${this.hass}
        .hacs=${this.hacs}
        .route=${this.route}
        .narrow=${this.narrow}
        .lovelace=${this.hacs.resources}
        .status=${this.hacs.status}
      >
      </hacs-tabbed-menu>
      ${this.section.split("/")[1] === "new"
        ? ""
        : this.narrow
        ? html`
            <div slot="header">
              <slot name="header">
                <search-input
                  class="header"
                  no-label-float
                  .label=${this.hacs.localize("search.installed")}
                  .filter=${this._searchInput || ""}
                  @value-changed=${this._inputValueChanged}
                ></search-input>
              </slot>
            </div>
          `
        : html`<div class="search">
            <search-input
              no-label-float
              .label=${this.hacs.localize("search.installed")}
              .filter=${this._searchInput || ""}
              @value-changed=${this._inputValueChanged}
            ></search-input>
          </div>`}
      <div class="content ${this.narrow ? "narrow-content" : ""}">
        ${this.filters[this.section.split("/")[1]]?.length > 1
          ? html`<div class="filters">
              <hacs-filter
                .hacs=${this.hacs}
                .filters="${this.filters[this.section.split("/")[1]]}"
              ></hacs-filter>
            </div>`
          : ""}
        <div class="container ${this.narrow ? "narrow" : ""}">
          ${this.hacs.repositories === undefined ? "" : this._renderRepositories()}
        </div>
      </div>
    </hass-tabs-subpage>`;
  }

  private _renderRepositories(): TemplateResult[] {
    return this.visibleRepositories.map(
      (repo) =>
        html`<hacs-repository-card
          .hass=${this.hass}
          .hacs=${this.hacs}
          .repository=${repo}
          .narrow=${this.narrow}
          ?narrow=${this.narrow}
          .status=${this.hacs.status}
          .removed=${this.hacs.removed}
          .addedToLovelace=${this.hacs.addedToLovelace(this.hacs, repo)}
          .section=${this.section}
        ></hacs-repository-card>`
    );
  }

  private _inputValueChanged(ev: any) {
    this._searchInput = ev.detail.value;
    window.localStorage.setItem("hacs-search", this._searchInput);
  }

  static get styles() {
    return [
      HacsStyles,
      hassTabsSubpage,
      fabStyles,
      searchStyles,
      scrollBarStyle,
      css`
        .filter {
          border-bottom: 1px solid var(--divider-color);
        }
        .content {
          height: calc(100vh - 128px);
          overflow: auto;
        }
        .narrow-content {
          height: calc(100vh - 128px);
        }
        .container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
          justify-items: center;
          grid-gap: 8px 8px;
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
          color: var(--hcv-text-color-primary);
        }
        hacs-repository-card {
          max-width: 500px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        hacs-repository-card[narrow] {
          width: 100%;
        }
        hacs-repository-card[narrow]:last-of-type {
          margin-bottom: 64px;
        }
        .narrow {
          width: 100%;
          display: block;
          padding: 0px;
          margin: 0;
        }

        .container .narrow {
          margin-bottom: 128px;
        }

        .bottom-bar {
          position: fixed !important;
        }
      `,
    ];
  }
}
