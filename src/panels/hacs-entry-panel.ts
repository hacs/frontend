import "@polymer/app-layout/app-header-layout/app-header-layout";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
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
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import {
  Status,
  Message,
  Repository,
  LovelaceResource,
  Configuration,
  sortRepositoriesByName,
  RemovedRepository,
} from "../data/common";
import "../layout/hacs-single-page-layout";

import "../../homeassistant-frontend/src/components/ha-card";
import "../../homeassistant-frontend/src/components/ha-svg-icon";
import "../../homeassistant-frontend/src/components/ha-menu-button";

import "../../homeassistant-frontend/src/panels/config/ha-config-section";
import "../components/hacs-section-navigation";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import { mdiAlertCircle } from "@mdi/js";
import { HacsStyles } from "../styles/hacs-common-style";
import { getMessages } from "../tools/get-messages";
import { localize } from "../localize/localize";
import { sections } from "./hacs-sections";

@customElement("hacs-entry-panel")
export class HacsEntryPanel extends LitElement {
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public lovelace: LovelaceResource[];
  @property({ attribute: false }) public repositories: Repository[];
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public status: Status;
  @property({ attribute: false }) public removed: RemovedRepository[];
  @property({ type: Boolean }) public isWide!: boolean;
  @property({ type: Boolean }) public narrow!: boolean;

  private _panelsEnabled = memoizeOne((sections: any, config: Configuration) => {
    return sections.panels.filter((panel) => {
      const categories = panel.categories;
      if (categories === undefined) return true;
      return categories.filter((c) => config?.categories.includes(c)).length !== 0;
    });
  });

  protected render(): TemplateResult | void {
    sections.updates = []; // reset so we don't get duplicates
    sections.messages = []; // reset so we don't get duplicates
    const messages: Message[] = getMessages(
      this.status,
      this.configuration,
      this.lovelace,
      this.repositories,
      this.removed
    );

    this.repositories?.forEach((repo) => {
      if (repo.pending_upgrade) {
        sections.updates.push(repo);
      }
    });

    messages?.forEach((message) => {
      sections.messages.push({
        iconPath: mdiAlertCircle,
        name: message.name,
        info: message.info,
        path: message.path || "",
        class: message.severity,
      });
    });

    //const enabledSections = this._panelsEnabled(sections, this.configuration);

    return html`
      <app-header-layout has-scrolling-region>
        <app-header fixed slot="header">
          <app-toolbar>
            <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
          </app-toolbar>
        </app-header>
        <ha-config-section .narrow=${this.narrow} .isWide=${this.isWide}>
          <div slot="header">
            ${this.narrow ? "HACS" : "Home Assistant Community Store"}
          </div>

          <div slot="introduction">
            ${this.isWide || (sections.updates.length === 0 && messages.length === 0)
              ? localize("entry.intro")
              : ""}
          </div>

          ${sections.messages.length !== 0
            ? html`
                <hacs-section-navigation
                  .header=${localize("entry.information")}
                  .pages=${sections.messages}
                  noNext
                ></hacs-section-navigation>
              `
            : ""}
          ${sections.updates.length !== 0
            ? html` <ha-card>
                <div class="header">${localize("entry.pending_updates")}</div>
                ${sortRepositoriesByName(sections.updates).map(
                  (repository) =>
                    html`
                      <paper-icon-item @click="${() => this._openUpdateDialog(repository)}">
                        <ha-icon
                          class="pending_update"
                          icon="mdi:arrow-up-circle"
                          slot="item-icon"
                        ></ha-icon>
                        <paper-item-body two-line>
                          ${repository.name}
                          <div secondary>
                            ${localize("sections.pending_repository_upgrade")
                              .replace("{installed}", repository.installed_version)
                              .replace("{available}", repository.available_version)}
                          </div>
                        </paper-item-body>
                      </paper-icon-item>
                    `
                )}
              </ha-card>`
            : ""}
          <hacs-section-navigation .pages=${sections.subsections.main}></hacs-section-navigation>
          <ha-card>
            <paper-icon-item @click=${this._openAboutDialog}>
              <ha-svg-icon .path=${mdiAlertCircle} slot="item-icon"></ha-svg-icon>
              <paper-item-body two-line>
                ${localize(`sections.about.title`)}
                <div secondary>
                  ${localize(`sections.about.description`)}
                </div>
              </paper-item-body>
            </paper-icon-item>
          </ha-card>
        </ha-config-section>
      </app-header-layout>
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
      haStyle,
      HacsStyles,
      css`
        paper-icon-item {
          cursor: pointer;
        }
        paper-icon-item[information] {
          cursor: normal;
        }

        app-header-layout {
          display: contents;
        }

        ha-config-section {
          color: var(--primary-text-color);
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
