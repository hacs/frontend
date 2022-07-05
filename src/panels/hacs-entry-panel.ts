import "@material/mwc-button/mwc-button";
import "@material/mwc-list/mwc-list";
import { mdiAlertCircle, mdiGithub, mdiHomeAssistant, mdiInformation } from "@mdi/js";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { isComponentLoaded } from "../../homeassistant-frontend/src/common/config/is_component_loaded";
import { navigate } from "../../homeassistant-frontend/src/common/navigate";
import { computeRTL } from "../../homeassistant-frontend/src/common/util/compute_rtl";
import "../../homeassistant-frontend/src/components/ha-alert";
import "../../homeassistant-frontend/src/components/ha-card";
import "../../homeassistant-frontend/src/components/ha-clickable-list-item";
import "../../homeassistant-frontend/src/components/ha-icon-next";
import "../../homeassistant-frontend/src/components/ha-menu-button";
import "../../homeassistant-frontend/src/components/ha-svg-icon";
import "../../homeassistant-frontend/src/layouts/ha-app-layout";
import "../../homeassistant-frontend/src/panels/config/ha-config-section";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";
import { HomeAssistant, Route } from "../../homeassistant-frontend/src/types";
import { brandsUrl } from "../../homeassistant-frontend/src/util/brands-url";
import { showDialogAbout } from "../components/dialogs/hacs-about-dialog";
import { Message, sortRepositoriesByName } from "../data/common";
import { Hacs } from "../data/hacs";
import { RepositoryBase } from "../data/repository";
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
    const updates: RepositoryBase[] = [];
    const messages: Message[] = [];
    const allMessages: Message[] = getMessages(this.hacs, isComponentLoaded(this.hass, "my"));

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
                          ? this.hacs.localize("common.show")
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
            ? html` <ha-card outlined>
                <div class="title">${this.hacs.localize("common.updates")}</div>
                <mwc-list>
                  ${sortRepositoriesByName(this.hacs.updates).map(
                    (repository) => html`
                      <ha-clickable-list-item
                        graphic="avatar"
                        disableHref
                        twoline
                        @click=${() => this._openUpdateDialog(repository)}
                      >
                        ${repository.category === "integration"
                          ? html`
                              <img
                                loading="lazy"
                                .src=${brandsUrl({
                                  domain: repository.domain,
                                  darkOptimized: this.hass.themes.darkMode,
                                  type: "icon",
                                })}
                                referrerpolicy="no-referrer"
                                @error=${this._onImageError}
                                @load=${this._onImageLoad}
                                slot="graphic"
                              />
                            `
                          : html`
                              <ha-svg-icon
                                slot="graphic"
                                path="${mdiGithub}"
                                style="padding-left: 0; height: 40px; width: 40px;"
                              >
                              </ha-svg-icon>
                            `}
                        <span>${repository.name}</span>
                        <span slot="secondary"
                          >${this.hacs.localize("sections.pending_repository_upgrade", {
                            downloaded: repository.installed_version,
                            available: repository.available_version,
                          })}</span
                        >
                      </ha-clickable-list-item>
                    `
                  )}
                </mwc-list>
              </ha-card>`
            : ""}

          <ha-card outlined>
            <mwc-list>
              ${this.hacs.sections.map(
                (page) => html`
                  <ha-clickable-list-item
                    graphic="avatar"
                    twoline
                    .hasMeta=${!this.narrow}
                    href=${page.path}
                  >
                    <div
                      slot="graphic"
                      class=${page.iconColor ? "icon-background" : ""}
                      .style="background-color: ${page.iconColor || "undefined"}"
                    >
                      <ha-svg-icon .path=${page.iconPath}></ha-svg-icon>
                    </div>
                    <span>${page.name}</span>
                    <span slot="secondary">${page.description}</span>
                    ${!this.narrow ? html`<ha-icon-next slot="meta"></ha-icon-next>` : ""}
                  </ha-clickable-list-item>
                `
              )}
              ${isComponentLoaded(this.hass, "my") && isComponentLoaded(this.hass, "hassio")
                ? html`
                    <ha-clickable-list-item
                      graphic="avatar"
                      disableHref
                      twoline
                      @click=${this._openSupervisorDialog}
                      .hasMeta=${!this.narrow}
                    >
                      <div
                        class="icon-background"
                        slot="graphic"
                        style="background-color: rgb(64, 132, 205)"
                      >
                        <ha-svg-icon .path=${mdiHomeAssistant}></ha-svg-icon>
                      </div>
                      <span>${this.hacs.localize(`sections.addon.title`)}</span>
                      <span slot="secondary"
                        >${this.hacs.localize(`sections.addon.description`)}</span
                      >
                    </ha-clickable-list-item>
                  `
                : ""}
              <ha-clickable-list-item
                graphic="avatar"
                twoline
                @click=${this._openAboutDialog}
                disableHref
              >
                <div
                  class="icon-background"
                  slot="graphic"
                  style="background-color: rgb(74, 89, 99)"
                >
                  <ha-svg-icon .path=${mdiInformation}></ha-svg-icon>
                </div>
                <span>${this.hacs.localize(`sections.about.title`)}</span>
                <span slot="secondary">${this.hacs.localize(`sections.about.description`)}</span>
              </ha-clickable-list-item>
            </mwc-list>
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

  private _openUpdateDialog(repository: RepositoryBase) {
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
          path: "/_my_redirect/supervisor",
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
        :host {
          --mdc-list-vertical-padding: 0;
        }
        ha-card:last-child {
          margin-bottom: env(safe-area-inset-bottom);
        }
        :host(:not([narrow])) ha-card:last-child {
          margin-bottom: max(24px, env(safe-area-inset-bottom));
        }
        ha-config-section {
          margin: auto;
          margin-top: -32px;
          max-width: 600px;
        }
        ha-card {
          overflow: hidden;
        }
        ha-card a {
          text-decoration: none;
          color: var(--primary-text-color);
        }
        a.button {
          display: block;
          color: var(--primary-color);
          padding: 16px;
        }
        .title {
          font-size: 16px;
          padding: 16px;
          padding-bottom: 0;
        }

        @media all and (max-width: 600px) {
          ha-card {
            border-width: 1px 0;
            border-radius: 0;
            box-shadow: unset;
          }
          ha-config-section {
            margin-top: -42px;
          }
        }

        ha-svg-icon,
        ha-icon-next {
          color: var(--secondary-text-color);
          height: 24px;
          width: 24px;
          display: block;
        }
        ha-svg-icon {
          padding: 8px;
        }
        .icon-background {
          border-radius: 50%;
        }
        .icon-background ha-svg-icon {
          color: #fff;
        }
        ha-clickable-list-item {
          cursor: pointer;
          font-size: 16px;
          padding: 0;
        }
      `,
    ];
  }
}
