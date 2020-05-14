import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";
import {
  css,
  CSSResultArray,
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";
import {
  Route,
  Repository,
  LovelaceResource,
  Configuration,
  sortRepositoriesByName,
} from "../data/common";
import "../layout/hacs-single-page-layout";

import { HacsCommonStyle } from "../styles/hacs-common-style";

import { localize } from "../localize/localize";

import { sections, panelEnabled } from "./hacs-sections";
//import "../components/hacs-link";

@customElement("hacs-entry-panel")
export class HacsEntryPanel extends LitElement {
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public repositories: Repository[];
  @property({ attribute: false }) public lovelace: LovelaceResource[];

  protected render(): TemplateResult | void {
    sections.updates = []; // reset so we don't get duplicates
    this.repositories?.forEach((repo) => {
      if (repo.pending_upgrade) {
        sections.updates.push(repo);
      }
    });
    return html`
      <hacs-single-page-layout
        .hass=${this.hass}
        .route=${this.route}
        .narrow=${this.narrow}
        header="Home Assistant Community Store"
        intro="${sections.updates.length === 0
          ? "Updates and important messages will show here if there are any"
          : ""}"
      >
        ${sections.updates.length !== 0
          ? html` <ha-card>
              <div class="header">${localize("store.pending_upgrades")}</div>
              ${sortRepositoriesByName(sections.updates).map(
                (repository) =>
                  html`
                    <paper-icon-item
                      @click="${() => this._openUpdateDialog(repository)}"
                    >
                      <ha-icon
                        class="pending_upgrade"
                        icon="mdi:arrow-up-circle"
                        slot="item-icon"
                      ></ha-icon>
                      <paper-item-body two-line>
                        ${repository.name}
                        <div secondary>
                          ${localize("sections.pending_repository_upgrade")
                            .replace(
                              "{installed}",
                              repository.installed_version
                            )
                            .replace(
                              "{available}",
                              repository.available_version
                            )}
                        </div>
                      </paper-item-body>
                    </paper-icon-item>
                  `
              )}
            </ha-card>`
          : ""}
        <ha-card>
          ${sections.panels.map(
            (panel) =>
              html`
                <paper-icon-item @click=${() => this._changeLocation(panel.id)}>
                  <ha-icon .icon=${panel.icon} slot="item-icon"></ha-icon>
                  <paper-item-body two-line>
                    ${localize(`sections.${panel.id}.title`)}
                    <div secondary>
                      ${localize(`sections.${panel.id}.description`)}
                    </div>
                  </paper-item-body>
                  <ha-icon icon="mdi:chevron-right"></ha-icon>
                </paper-icon-item>
              `
          )}
          <paper-icon-item @click=${this._openAboutDialog}>
            <ha-icon icon="mdi:information" slot="item-icon"></ha-icon>
            <paper-item-body two-line>
              ${localize(`sections.about.title`)}
              <div secondary>
                ${localize(`sections.about.description`)}
              </div>
            </paper-item-body>
          </paper-icon-item>
        </ha-card>
      </hacs-single-page-layout>
    `;
  }

  private _openUpdateDialog(repository: Repository) {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "update",
          repository: repository.id,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _openAboutDialog() {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "about",
          configuration: this.configuration,
          repositories: this.repositories,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  static get styles(): CSSResultArray {
    return [
      HacsCommonStyle,
      css`
        a {
          text-decoration: none;
          color: var(--primary-text-color);
          position: relative;
          display: block;
          outline: 0;
        }
        ha-icon {
          color: var(--secondary-text-color);
        }
        .iron-selected paper-item::before {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          pointer-events: none;
          content: "";
          transition: opacity 15ms linear;
          will-change: opacity;
        }
        paper-icon-item {
          cursor: pointer;
        }
        .iron-selected paper-item:focus::before,
        .iron-selected:focus paper-item::before {
          opacity: 0.2;
        }

        paper-item-body {
          width: 100%;
          min-height: var(--paper-item-body-two-line-min-height, 72px);
          display: var(--layout-vertical_-_display);
          flex-direction: var(--layout-vertical_-_flex-direction);
          justify-content: var(--layout-center-justified_-_justify-content);
        }
        paper-item-body div {
          font-size: 14px;
          color: var(--secondary-text-color);
        }
      `,
    ];
  }

  private _changeLocation(id: string): void {
    this.route.path = `/${id}`;
    this.dispatchEvent(
      new CustomEvent("hacs-location-changed", {
        detail: { route: this.route },
        bubbles: true,
        composed: true,
      })
    );
  }
}
