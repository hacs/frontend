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
import memoizeOne from "memoize-one";
import { HomeAssistant } from "custom-card-helpers";
import {
  Route,
  Status,
  Message,
  Repository,
  LovelaceResource,
  Configuration,
  sortRepositoriesByName,
} from "../data/common";
import "../layout/hacs-single-page-layout";

import { HacsStyles } from "../styles/hacs-common-style";
import { getMessages } from "../tools/get-messages";
import { localize } from "../localize/localize";
import { navigate } from "../tools/navigate";
import { sections } from "./hacs-sections";
//import "../components/hacs-link";

@customElement("hacs-entry-panel")
export class HacsEntryPanel extends LitElement {
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public lovelace: LovelaceResource[];
  @property({ attribute: false }) public repositories: Repository[];
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public status: Status;
  @property({ type: Boolean }) public isWide!: boolean;
  @property({ type: Boolean }) public narrow!: boolean;

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
    const messages: Message[] = getMessages(
      this.status,
      this.configuration,
      this.lovelace,
      this.repositories
    );
    this.isWide =
      window.localStorage.getItem("dockedSidebar") === '"always_hidden"';

    sections.updates = []; // reset so we don't get duplicates
    this.repositories?.forEach((repo) => {
      if (repo.pending_upgrade) {
        sections.updates.push(repo);
      }
    });

    const enabledSections = this._panelsEnabled(sections, this.configuration);

    return html`
      <hacs-single-page-layout
        .hass=${this.hass}
        .route=${this.route}
        .narrow=${this.narrow}
        .header=${this.narrow ? "HACS" : "Home Assistant Community Store"}
        intro="${this.isWide ||
        (sections.updates.length === 0 && messages.length === 0)
          ? localize("entry.intro")
          : ""}"
      >
        ${messages.length !== 0
          ? html` <ha-card>
              <div class="header">${localize("entry.information")}</div>
              ${messages.map(
                (message) =>
                  html`
                    <paper-icon-item
                      ?disabled=${!message.path}
                      information
                      @click=${() => this._navigate(message)}
                    >
                      <ha-icon
                        class="${message.severity}"
                        icon="mdi:alert-circle"
                        slot="item-icon"
                      ></ha-icon>
                      <paper-item-body two-line>
                        ${message.title}
                        <div secondary>
                          ${message.content}
                        </div>
                      </paper-item-body>
                    </paper-icon-item>
                  `
              )}
            </ha-card>`
          : ""}
        ${sections.updates.length !== 0
          ? html` <ha-card>
              <div class="header">${localize("entry.pending_updates")}</div>
              ${sortRepositoriesByName(sections.updates).map(
                (repository) =>
                  html`
                    <paper-icon-item
                      @click="${() => this._openUpdateDialog(repository)}"
                    >
                      <ha-icon
                        class="pending_update"
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
          ${enabledSections.map(
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
                  <ha-icon-button icon="mdi:chevron-right"></ha-icon-button>
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

  private _navigate(message: Message): void {
    if (message.path) {
      console.log(message);
      navigate(this, message.path);
      window.location.reload();
    }
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyles,
      css`
        paper-icon-item {
          cursor: pointer;
        }
        paper-icon-item[information] {
          cursor: normal;
        }

        paper-item-body {
          width: 100%;
          min-height: var(--paper-item-body-two-line-min-height, 72px);
          display: var(--layout-vertical_-_display);
          flex-direction: var(--layout-vertical_-_flex-direction);
          justify-content: var(--layout-center-justified_-_justify-content);
        }
        paper-item-body {
          color: var(--hcv-text-color-primary);
        }
        paper-item-body div {
          font-size: 14px;
          color: var(--hcv-text-color-secondary);
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
