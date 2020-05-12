import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";
import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";
import { Route, Repository, LovelaceResource } from "../data/common";
import "../layout/hacs-single-page-layout";
//import "../components/hacs-link";

export const sections = {
  updates: [],
  panels: [
    {
      title: "Integrations",
      description: "This is where you find custom component/integrations",
      icon: "mdi:puzzle",
      id: "integrations",
      categories: ["integration"],
    },
    {
      title: "Frontend",
      description: "This is where you find lovelace elements and themes",
      icon: "mdi:palette",
      id: "frontend",
      categories: ["plugin", "theme"],
    },
    {
      title: "Automation",
      description:
        "This is where you find python_scripts, AppDaemon apps and NetDaemon apps",
      icon: "mdi:robot",
      id: "automation",
      categories: ["python_script", "appdaemon", "netdaemon"],
    },
    {
      title: "Settings",
      description: "This is where you can manage HACS",
      icon: "mdi:cogs",
      id: "settings",
    },
  ],
};

@customElement("hacs-entry-panel")
export class HacsEntryPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public repositories: Repository[];
  @property({ attribute: false }) public lovelace: LovelaceResource[];

  protected render(): TemplateResult | void {
    this.repositories?.forEach((repo) => {
      if (repo.pending_upgrade) {
        sections.updates.push({
          title: repo.name,
          id: repo.id,
          installed: repo.installed_version,
          available: repo.available_version,
        });
      }
    });
    return html`
      <hacs-single-page-layout
        .hass=${this.hass}
        .route=${this.route}
        .narrow=${this.narrow}
        header="Home Assistant Community Store"
        intro=""
      >
        ${sections.updates.length !== 0
          ? html` <ha-card>
              <div class="header">Pending updates</div>
              ${sections.updates.map(
                (repository) =>
                  html`
                    <paper-icon-item .id=${repository.id}>
                      <ha-icon
                        class="pending_upgrade"
                        icon="mdi:arrow-up-circle"
                        slot="item-icon"
                      ></ha-icon>
                      <paper-item-body two-line>
                        ${repository.title}
                        <div secondary>
                          You are running version ${repository.installed},
                          version ${repository.available} is available
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
                    ${panel.title}
                    <div secondary>
                      ${panel.description}
                    </div>
                  </paper-item-body>
                  <ha-icon icon="mdi:chevron-right"></ha-icon>
                </paper-icon-item>
              `
          )}
        </ha-card>
      </hacs-single-page-layout>
    `;
  }

  static get styles(): CSSResult {
    return css`
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
        padding: 12px 16px;
        cursor: pointer;
      }
      .iron-selected paper-item:focus::before,
      .iron-selected:focus paper-item::before {
        opacity: 0.2;
      }

      paper-item-body {
        width: 100%;
      }
      paper-item-body div {
        font-size: 14px;
        color: var(--secondary-text-color);
      }
      .header {
        font-size: var(--paper-font-headline_-_font-size);
        opacity: var(--dark-primary-opacity);
        padding: 8px 0 4px 16px;
      }
      .pending_upgrade {
        color: orange;
      }
    `;
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
