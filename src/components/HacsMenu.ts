import {
  LitElement,
  CSSResultArray,
  TemplateResult,
  html,
  css,
  customElement,
  property
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";
import { HacsStyle } from "../style/hacs-style";
import { HACS } from "../Hacs";
import { Repository, Status, Configuration } from "../types";

import { AboutHacs } from "../misc/AboutHacs";

import swal from "sweetalert";

@customElement("hacs-menu")
export class HacsMenu extends LitElement {
  @property() public location!: string;
  @property({ type: Object }) public hacs!: HACS;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public configuration!: Configuration;
  @property({ type: Object }) public status!: Status;
  @property({ type: Array }) public repositories!: Repository[];

  protected render(): TemplateResult | void {
    return html`
      <paper-menu-button
        horizontal-align="right"
        role="group"
        aria-haspopup="true"
        vertical-align="top"
        aria-disabled="false"
      >
        <paper-icon-button
          icon="hass:dots-vertical"
          slot="dropdown-trigger"
          role="button"
        ></paper-icon-button>
        <paper-listbox
          slot="dropdown-content"
          role="listbox"
          tabindex="0"
          dir="rtl"
        >
          <paper-item @click=${this.openHelp}
            >${this.hacs.localize("common.documentation")}
          </paper-item>

          <paper-item @click=${this.ReloadData}>
            ${this.hacs.localize("settings.reload_data")}
          </paper-item>

          ${this.location.includes("installed")
            ? html`
                <paper-item @click=${this.UpgradeAll} class="uninstall-button">
                  ${this.hacs.localize("settings.upgrade_all")}
                </paper-item>
              `
            : ""}

          <a href="https://github.com/hacs" target="_blank" rel="noreferrer">
            <paper-item>
              ${this.hacs.localize(`settings.hacs_repo`)}
            </paper-item>
          </a>

          <a
            href="https://hacs.xyz/docs/issues"
            target="_blank"
            rel="noreferrer"
          >
            <paper-item>
              ${this.hacs.localize(`repository.open_issue`)}
            </paper-item>
          </a>
          ${!this.location.includes("settings")
            ? html`
                <paper-item>
                  <ha-switch
                    .checked=${this.configuration.frontend_mode === "Table"}
                    @change=${this.SetFeStyle}
                    ><div class="switch-text">Table</div></ha-switch
                  >
                </paper-item>
                <paper-item>
                  <ha-switch
                    .checked=${this.configuration.frontend_compact}
                    @change=${this.SetFeCompact}
                    ><div class="switch-text">Compact</div>
                  </ha-switch>
                </paper-item>
              `
            : ""}

          <paper-item @click=${this.openAbout}
            >${this.hacs.localize("common.about")}
          </paper-item>
        </paper-listbox>
      </paper-menu-button>
    `;
  }

  disabledAction() {
    swal(this.hacs.localize("confirm.bg_task"));
  }

  SetFeStyle() {
    this.hass.connection.sendMessage({
      type: "hacs/settings",
      action: `set_fe_${
        this.configuration.frontend_mode !== "Table" ? "table" : "grid"
      }`
    });
  }

  SetFeCompact() {
    this.hass.connection.sendMessage({
      type: "hacs/settings",
      action: `set_fe_compact_${String(
        this.configuration.frontend_compact
      ).toLocaleLowerCase()}`
    });
  }

  ReloadData() {
    if (this.status.background_task) {
      this.disabledAction();
      return;
    }
    swal(
      `${this.hacs.localize(`confirm.reload_data`)}\n${this.hacs.localize(
        "confirm.continue"
      )}`,
      {
        buttons: [
          this.hacs.localize("confirm.cancel"),
          this.hacs.localize("confirm.yes")
        ]
      }
    ).then(value => {
      if (value !== null) {
        this.hass.connection.sendMessage({
          type: "hacs/settings",
          action: "reload_data"
        });
      }
    });
  }

  UpgradeAll() {
    if (this.status.background_task) {
      this.disabledAction();
      return;
    }
    var elements: Repository[] = [];
    this.repositories.forEach(element => {
      if (element.pending_upgrade) elements.push(element);
    });
    if (elements.length > 0) {
      var msg = this.hacs.localize(`confirm.upgrade_all`) + "\n\n";
      elements.forEach(element => {
        msg += `${element.name}: ${element.installed_version} -> ${element.available_version}\n`;
      });
      msg += `\n${this.hacs.localize("confirm.continue")}`;
      swal(msg, {
        buttons: [
          this.hacs.localize("confirm.cancel"),
          this.hacs.localize("confirm.yes")
        ]
      }).then(value => {
        if (value !== null) {
          this.hass.connection.sendMessage({
            type: "hacs/settings",
            action: "upgrade_all"
          });
        }
      });
    } else {
      swal(this.hacs.localize(`confirm.no_upgrades`), {
        buttons: [this.hacs.localize("confirm.ok")]
      });
    }
  }

  openAbout() {
    swal({
      buttons: [false],
      content: AboutHacs(
        this.hacs,
        this.repositories,
        this.configuration
      ) as any
    });
  }

  openHelp() {
    const base = "https://hacs.xyz/docs/navigation/";
    var location = window.location.pathname.split("/")[2];
    if (
      ["integration", "plugin", "appdaemon", "python_script", "theme"].includes(
        location
      )
    )
      location = "stores";
    window.open(`${base}${location}`, "Help", "noreferrer");
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`
        paper-listbox {
          top: 0px;
          overflow: hidden;
        }
        a {
          color: var(--primary-text-color);
        }
        ha-icon {
          cursor: pointer;
          float: right;
        }
        ha-switch {
          right: -24px;
        }
        .switch-text {
          margin-right: 8px;
        }
        .dropdown-content {
          overflow: hidden;
          right: 0;
          top: 0;
        }
        .extended {
          display: block !important;
        }
        paper-item {
          display: flex;
          font-size: 14px;
          background-color: var(
            --paper-listbox-background-color,
            var(--primary-background-color)
          );
        }
      `
    ];
  }
}
