import {
  customElement,
  css,
  CSSResultArray,
  TemplateResult,
  html,
  LitElement,
  property,
} from "lit-element";
import { RepositoryData, Route } from "../../data";
import { HacsStyle } from "../../style/hacs-style";
import { HomeAssistant } from "custom-card-helpers";
import { localize } from "../../../localize/localize";

@customElement("hacs-repository-menu")
export class HacsRepositoryMenu extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public repository!: RepositoryData;
  @property({ attribute: false }) public route!: Route;

  protected render(): TemplateResult | void {
    return html`
      <paper-menu-button
        no-animations
        horizontal-align="right"
        role="group"
        aria-haspopup="true"
        vertical-align="top"
        aria-disabled="false"
      >
        <ha-icon-button
          icon="hass:dots-vertical"
          slot="dropdown-trigger"
          role="button"
        ></ha-icon-button>
        <paper-listbox
          slot="dropdown-content"
          role="listbox"
          tabindex="0"
          dir="rtl"
        >
          <paper-item @click=${this.RepositoryReload}>
            ${localize(`repository.update_information`)}
          </paper-item>

          ${this.repository.version_or_commit === "version"
            ? html`
                <paper-item @click=${this.RepositoryBeta}>
                  ${this.repository.beta
                    ? localize(`repository.hide_beta`)
                    : localize(`repository.show_beta`)}
                </paper-item>
              `
            : ""}
          ${!this.repository.custom && !this.repository.installed
            ? html`
                <paper-item @click=${this.RepositoryHide}>
                  ${localize(`repository.hide`)}
                </paper-item>
              `
            : ""}

          <hacs-link .url="https://github.com/${this.repository.full_name}">
            <paper-item>
              ${localize(`repository.open_issue`)}
            </paper-item>
          </hacs-link>

          <hacs-link
            .url="https://github.com/hacs/integration/issues/new?assignees=ludeeus&labels=flag&template=flag.md&title=${this
              .repository.full_name}"
          >
            <paper-item>
              ${localize(`repository.flag_this`)}
            </paper-item>
          </hacs-link>
        </paper-listbox>
      </paper-menu-button>
    `;
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`
        paper-dropdown-menu {
          width: 250px;
          margin-top: -24px;
        }
        paper-menu-button {
          float: right;
          top: -68px;
        }
        paper-item {
          color: var(--primary-text-color);
          display: flex;
          background-color: var(
            --paper-listbox-background-color,
            var(--primary-background-color)
          );
        }
      `,
    ];
  }

  RepositoryReload() {
    this.dispatchEvent(
      new CustomEvent("hacs-repository-action", {
        detail: {
          repo: this.repository.id,
          action: "set_state",
          data: "other",
        },
        bubbles: true,
        composed: true,
      })
    );
    this.dispatchEvent(
      new CustomEvent("hacs-repository-action", {
        detail: { repo: this.repository.id, action: "update" },
        bubbles: true,
        composed: true,
      })
    );
  }

  RepositoryBeta() {
    this.dispatchEvent(
      new CustomEvent("hacs-repository-action", {
        detail: {
          repo: this.repository.id,
          action: "set_state",
          data: "other",
        },
        bubbles: true,
        composed: true,
      })
    );
    if (this.repository.beta) {
      this.dispatchEvent(
        new CustomEvent("hacs-repository-action", {
          detail: { repo: this.repository.id, action: "hide_beta" },
          bubbles: true,
          composed: true,
        })
      );
    } else {
      this.dispatchEvent(
        new CustomEvent("hacs-repository-action", {
          detail: { repo: this.repository.id, action: "show_beta" },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  RepositoryHide() {
    this.dispatchEvent(
      new CustomEvent("hacs-repository-action", {
        detail: {
          repo: this.repository.id,
          action: "set_state",
          data: "other",
        },
        bubbles: true,
        composed: true,
      })
    );
    if (this.repository.hide) {
      this.dispatchEvent(
        new CustomEvent("hacs-repository-action", {
          detail: { repo: this.repository.id, action: "unhide" },
          bubbles: true,
          composed: true,
        })
      );
    } else {
      this.dispatchEvent(
        new CustomEvent("hacs-repository-action", {
          detail: { repo: this.repository.id, action: "hide" },
          bubbles: true,
          composed: true,
        })
      );
    }
    this.dispatchEvent(
      new CustomEvent("hacs-location-change", {
        detail: { value: this.repository.category },
        bubbles: true,
        composed: true,
      })
    );
  }
}
