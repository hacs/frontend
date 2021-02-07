import { mdiAlertCircle, mdiHomeAssistant, mdiOpenInNew } from "@mdi/js";
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
  property,
  TemplateResult,
} from "lit-element";
import { isComponentLoaded } from "../../homeassistant-frontend/src/common/config/is_component_loaded";
import "../../homeassistant-frontend/src/components/ha-card";
import "../../homeassistant-frontend/src/components/ha-menu-button";
import "../../homeassistant-frontend/src/components/ha-svg-icon";
import "../../homeassistant-frontend/src/panels/config/ha-config-section";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import "../components/hacs-section-navigation";
import {
  Configuration,
  LovelaceResource,
  Message,
  RemovedRepository,
  Repository,
  sortRepositoriesByName,
  Status,
} from "../data/common";
import { Hacs } from "../data/hacs";
import { HacsStyles } from "../styles/hacs-common-style";
import { getMessages } from "../tools/get-messages";

@customElement("hacs-entry-panel")
export class HacsEntryPanel extends LitElement {
  @property({ attribute: false }) public hacs?: Hacs;
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public repositories: Repository[];
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public lovelace: LovelaceResource[];
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public status: Status;
  @property({ attribute: false }) public removed: RemovedRepository[];
  @property({ type: Boolean }) public isWide!: boolean;
  @property({ type: Boolean }) public narrow!: boolean;

  protected render(): TemplateResult | void {
    const updates = [];
    const messages = [];
    const allMessages: Message[] = getMessages(this.hacs, this.repositories);

    this.repositories?.forEach((repo) => {
      if (repo.pending_upgrade) {
        updates.push(repo);
      }
    });

    allMessages?.forEach((message) => {
      messages.push({
        iconPath: mdiAlertCircle,
        name: message.name,
        info: message.info,
        secondary: message.secondary,
        path: message.path || "",
        class: message.severity,
        dialog: message.dialog,
        repository: message.repository,
      });
    });

    this.dispatchEvent(
      new CustomEvent("update-hacs", {
        detail: { messages, updates },
        bubbles: true,
        composed: true,
      })
    );

    return html`
      <app-header-layout has-scrolling-region>
        <app-header fixed slot="header">
          <app-toolbar>
            <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
          </app-toolbar>
        </app-header>
        <ha-config-section .narrow=${this.narrow} .isWide=${this.isWide}>
          <div slot="header">${this.narrow ? "HACS" : "Home Assistant Community Store"}</div>

          <div slot="introduction">
            ${this.isWide || (this.hacs.updates.length === 0 && this.hacs.messages?.length === 0)
              ? this.hacs.localize("entry.intro")
              : ""}
          </div>

          ${this.hacs.messages?.length !== 0
            ? html`
                <hacs-section-navigation
                  .hass=${this.hass}
                  .header=${this.hacs.localize("entry.information")}
                  .pages=${this.hacs.messages}
                  no-next
                ></hacs-section-navigation>
              `
            : ""}
          ${this.hacs.updates?.length !== 0
            ? html` <ha-card>
                <div class="header">${this.hacs.localize("entry.pending_updates")}</div>
                ${sortRepositoriesByName(this.hacs.updates).map(
                  (repository) =>
                    html`
                      <paper-icon-item @click="${() => this._openUpdateDialog(repository)}">
                        <ha-svg-icon
                          class="pending_update"
                          .path=${mdiAlertCircle}
                          slot="item-icon"
                        ></ha-svg-icon>
                        <paper-item-body two-line>
                          ${repository.name}
                          <div secondary>
                            ${this.hacs
                              .localize("sections.pending_repository_upgrade")
                              .replace("{installed}", repository.installed_version)
                              .replace("{available}", repository.available_version)}
                          </div>
                        </paper-item-body>
                      </paper-icon-item>
                    `
                )}
              </ha-card>`
            : ""}
          <hacs-section-navigation .pages=${this.hacs.sections}></hacs-section-navigation>

          <ha-card>
            ${isComponentLoaded(this.hass, "hassio")
              ? html`
                  <paper-icon-item @click=${this._openSupervisorDialog}>
                    <ha-svg-icon .path=${mdiHomeAssistant} slot="item-icon"></ha-svg-icon>
                    <paper-item-body two-line>
                      ${this.hacs.localize(`sections.addon.title`)}
                      <div secondary>${this.hacs.localize(`sections.addon.description`)}</div>
                    </paper-item-body>
                    <ha-svg-icon right .path=${mdiOpenInNew}></ha-svg-icon>
                  </paper-icon-item>
                `
              : ""}
          </ha-card>

          <ha-card>
            <paper-icon-item @click=${this._openAboutDialog}>
              <ha-svg-icon .path=${mdiAlertCircle} slot="item-icon"></ha-svg-icon>
              <paper-item-body two-line>
                ${this.hacs.localize(`sections.about.title`)}
                <div secondary>${this.hacs.localize(`sections.about.description`)}</div>
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

  private async _openAboutDialog() {
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

  private async _openSupervisorDialog() {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: "navigate",
          path: "/hassio",
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
        app-header,
        app-toolbar,
        ha-menu-button {
          color: var(--secondary-text-color);
          background-color: var(--primary-background-color);
          --app-header-background-color: var(--primary-background-color);
        }

        ha-svg-icon {
          color: var(--secondary-text-color);
        }

        ha-config-section {
          color: var(--primary-text-color);
          padding-bottom: 24px;
          margin-top: -24px;
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
        div[secondary] {
          white-space: normal;
        }
      `,
    ];
  }
}
