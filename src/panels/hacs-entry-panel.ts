import "@material/mwc-button/mwc-button";
import { mdiAlertCircle, mdiGithub, mdiHomeAssistant, mdiInformation, mdiOpenInNew } from "@mdi/js";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { isComponentLoaded } from "../../homeassistant-frontend/src/common/config/is_component_loaded";
import { navigate } from "../../homeassistant-frontend/src/common/navigate";
import { computeRTL } from "../../homeassistant-frontend/src/common/util/compute_rtl";
import "../../homeassistant-frontend/src/components/ha-alert";
import "../../homeassistant-frontend/src/components/ha-card";
import "../../homeassistant-frontend/src/components/ha-menu-button";
import "../../homeassistant-frontend/src/components/ha-svg-icon";
import "../../homeassistant-frontend/src/layouts/ha-app-layout";
import "../../homeassistant-frontend/src/panels/config/dashboard/ha-config-navigation";
import "../../homeassistant-frontend/src/panels/config/ha-config-section";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { brandsUrl } from "../../homeassistant-frontend/src/util/brands-url";
import { showDialogAbout } from "../components/dialogs/hacs-about-dialog";
import { Message, Repository, sortRepositoriesByName } from "../data/common";
import { Hacs } from "../data/hacs";
import { HacsStyles } from "../styles/hacs-common-style";
import { getMessages } from "../tools/get-messages";

@customElement("hacs-entry-panel")
export class HacsEntryPanel extends LitElement {
  @property({ attribute: false }) public hacs!: Hacs;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public route!: Route;

  @property({ type: Boolean, reflect: true })
  public narrow!: boolean;

  @property({ type: Boolean }) public isWide!: boolean;

  protected render(): TemplateResult | void {
    const updates: Repository[] = [];
    const messages: Message[] = [];
    const allMessages: Message[] = getMessages(this.hacs);

    this.hacs.repositories.forEach((repo) => {
      if (repo.pending_upgrade) {
        updates.push(repo);
      }
    });

    allMessages.forEach((message) => {
      messages.push({
        iconPath: mdiAlertCircle,
        name: message.name,
        info: message.info,
        secondary: message.secondary,
        path: message.path || "",
        severity: message.severity,
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
      <ha-app-layout>
        <app-header fixed slot="header">
          <app-toolbar>
            <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
            <div main-title>${this.narrow ? "HACS" : "Home Assistant Community Store"}</div>
          </app-toolbar>
        </app-header>
        <ha-config-section .narrow=${this.narrow} .isWide=${this.isWide} full-width>
          ${this.hacs.messages?.length !== 0
            ? this.hacs.messages.map(
                (message) =>
                  html`
                    <ha-alert
                      .alertType=${message.severity!}
                      .title=${message.secondary
                        ? `${message.name} - ${message.secondary}`
                        : message.name}
                      .rtl=${computeRTL(this.hass)}
                    >
                      ${message.info}
                      <mwc-button
                        slot="action"
                        .label=${message.path
                          ? this.hacs.localize("common.navigate")
                          : message.dialog
                          ? this.hacs.localize(`common.${message.dialog}`)
                          : ""}
                        @click=${() =>
                          message.path ? navigate(message.path) : this._openDialog(message)}
                      >
                      </mwc-button>
                    </ha-alert>
                  `
              )
            : !this.narrow
            ? ""
            : ""}
          ${this.hacs.updates?.length !== 0
            ? html` <ha-card>
                <div class="title">${this.hacs.localize("common.updates")}</div>
                ${sortRepositoriesByName(this.hacs.updates).map(
                  (repository) =>
                    html`
                      <paper-icon-item @click=${() => this._openUpdateDialog(repository)}>
                        ${repository.category === "integration"
                          ? html`
                              <img
                                slot="item-icon"
                                loading="lazy"
                                .src=${brandsUrl({
                                  domain: repository.domain,
                                  darkOptimized: this.hass.themes.darkMode,
                                  type: "icon",
                                })}
                                referrerpolicy="no-referrer"
                                @error=${this._onImageError}
                                @load=${this._onImageLoad}
                              />
                            `
                          : html`
                              <div slot="item-icon" class="icon-background">
                                <ha-svg-icon
                                  path="${mdiGithub}"
                                  style="padding-left: 0; height: 40px; width: 40px;"
                                ></ha-svg-icon>
                              </div>
                            `}
                        <paper-item-body two-line>
                          ${repository.name}
                          <div secondary>
                            ${this.hacs.localize("sections.pending_repository_upgrade", {
                              downloaded: repository.installed_version,
                              available: repository.available_version,
                            })}
                          </div>
                        </paper-item-body>
                        ${!this.narrow ? html`<ha-icon-next></ha-icon-next>` : ""}
                      </paper-icon-item>
                    `
                )}
              </ha-card>`
            : ""}

          <ha-card>
            <ha-config-navigation
              .hass=${this.hass}
              .pages=${this.hacs.sections}
              .narrow=${this.narrow}
            >
            </ha-config-navigation>

            ${isComponentLoaded(this.hass, "hassio")
              ? html`
                  <paper-icon-item @click=${this._openSupervisorDialog}>
                    <div
                      class="icon-background"
                      slot="item-icon"
                      style="background-color: rgb(64, 132, 205)"
                    >
                      <ha-svg-icon .path=${mdiHomeAssistant} slot="item-icon"></ha-svg-icon>
                    </div>
                    <paper-item-body two-line>
                      ${this.hacs.localize(`sections.addon.title`)}
                      <div secondary>${this.hacs.localize(`sections.addon.description`)}</div>
                    </paper-item-body>
                    ${!this.narrow
                      ? html`<ha-svg-icon right .path=${mdiOpenInNew}></ha-svg-icon>`
                      : ""}
                  </paper-icon-item>
                `
              : ""}

            <paper-icon-item @click=${this._openAboutDialog}>
              <div
                class="icon-background"
                slot="item-icon"
                style="background-color: rgb(74, 89, 99)"
              >
                <ha-svg-icon .path=${mdiInformation} slot="item-icon"></ha-svg-icon>
              </div>
              <paper-item-body two-line>
                ${this.hacs.localize(`sections.about.title`)}
                <div secondary>${this.hacs.localize(`sections.about.description`)}</div>
              </paper-item-body>
            </paper-icon-item>
          </ha-card>
        </ha-config-section>
      </ha-app-layout>
    `;
  }

  private _onImageLoad(ev) {
    ev.target.style.visibility = "initial";
  }

  private _onImageError(ev) {
    if (ev.target) {
      ev.target.outerHTML = `
      <div slot="item-icon" class="icon-background">
        <ha-svg-icon path="${mdiGithub}" style="padding-left: 0; height: 40px; width: 40px;"></ha-svg-icon>
      </div>`;
    }
  }

  private _openDialog(message: Message) {
    if (!message.dialog) {
      return;
    }
    if (message.dialog == "remove") {
      message.dialog = "removed";
    }
    this.dispatchEvent(
      new CustomEvent("hacs-dialog", {
        detail: {
          type: message.dialog,
          repository: message.repository,
        },
        bubbles: true,
        composed: true,
      })
    );
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
    showDialogAbout(this, this.hacs);
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

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      HacsStyles,
      css`
        :host(:not([narrow])) ha-card:last-child {
          margin-bottom: 24px;
        }
        ha-config-section {
          margin: auto;
          margin-top: -32px;
          max-width: 600px;
          color: var(--secondary-text-color);
        }
        ha-card {
          overflow: hidden;
        }
        ha-card a {
          text-decoration: none;
          color: var(--primary-text-color);
        }
        .title {
          font-size: 16px;
          padding: 16px;
          padding-bottom: 0;
        }
        :host([narrow]) ha-card {
          border-radius: 0;
          box-shadow: unset;
        }

        :host([narrow]) ha-config-section {
          margin-top: -42px;
        }
        .icon-background {
          border-radius: 50%;
        }
        .icon-background ha-svg-icon {
          color: #fff;
        }
        .title {
          font-size: 16px;
          padding: 16px;
          padding-bottom: 0;
        }
        ha-svg-icon,
        ha-icon-next {
          color: var(--secondary-text-color);
          height: 24px;
          width: 24px;
        }
        ha-svg-icon {
          padding: 8px;
        }

        img {
          max-height: 40px;
          max-width: 40px;
          border-radius: 50%;
        }
        paper-icon-item {
          cursor: pointer;
        }
      `,
    ];
  }
}
