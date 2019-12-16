import {
  LitElement,
  customElement,
  CSSResultArray,
  TemplateResult,
  html,
  css,
  property
} from "lit-element";

import { HomeAssistant } from "custom-card-helpers";
import { HacsStyle } from "../style/hacs-style";

import "../misc/CustomRepositories";
import "../misc/HiddenRepositories";
import "../components/HacsProgressbar";
import "../components/HacsBody";

import { localize } from "../localize/localize";
import swal from "sweetalert";

import { Configuration, Repository, Status } from "../types";

@customElement("hacs-settings")
export class HacsSettings extends LitElement {
  @property({ type: Array }) public repositories!: Repository[];
  @property({ type: Object }) public configuration!: Configuration;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public status!: Status;

  render(): TemplateResult | void {
    if (
      this.hass === undefined ||
      this.repositories === undefined ||
      this.configuration === undefined ||
      this.status === undefined
    ) {
      return html`
        <hacs-progressbar></hacs-progressbar>
      `;
    }
    return html`
      <hacs-body>
        <ha-card header="HACS (Home Assistant Community Store)">
          <div class="card-content">
            <p>
              <b>${localize("common.version")}:</b> ${this.configuration
                .version}
            </p>
            <p>
              <b>${localize("common.repositories")}:</b> ${this.repositories
                .length}
            </p>
            <div class="version-available">
              <ha-switch
                .checked=${this.configuration.frontend_mode === "Table"}
                @change=${this.SetFeStyle}
                >${localize(`settings.table_view`)}</ha-switch
              >
              ${this.configuration.experimental
                ? html`
                    <ha-switch
                      .checked=${this.configuration.frontend_compact}
                      @change=${this.SetFeCompact}
                      >${localize(`settings.compact_mode`)}</ha-switch
                    >
                  `
                : ""}
            </div>
          </div>
          <div class="card-actions MobileGrid">
            ${this.status.reloading_data
              ? html`
                  <mwc-button
                    class="disabled-button"
                    title="${localize("confirm.bg_task")}"
                    @click=${this.disabledAction}
                  >
                    <paper-spinner active></paper-spinner>
                  </mwc-button>
                `
              : html`
                  ${this.status.background_task
                    ? html`
                        <mwc-button
                          class="disabled-button"
                          title="${localize("confirm.bg_task")}"
                          @click=${this.disabledAction}
                        >
                          ${localize(`settings.reload_data`)}
                        </mwc-button>
                      `
                    : html`
                        <mwc-button @click=${this.ReloadData}>
                          ${localize(`settings.reload_data`)}
                        </mwc-button>
                      `}
                `}
            ${this.status.upgrading_all
              ? html`
                  <mwc-button
                    class="disabled-button"
                    title="${localize("confirm.bg_task")}"
                    @click=${this.disabledAction}
                  >
                    <paper-spinner active></paper-spinner>
                  </mwc-button>
                `
              : html`
                  ${this.status.background_task
                    ? html`
                        <mwc-button
                          class="disabled-button"
                          title="${localize("confirm.bg_task")}"
                          @click=${this.disabledAction}
                        >
                          ${localize(`settings.upgrade_all`)}
                        </mwc-button>
                      `
                    : html`
                        <mwc-button @click=${this.UpgradeAll}>
                          ${localize(`settings.upgrade_all`)}
                        </mwc-button>
                      `}
                `}

            <a
              href="https://github.com/hacs/integration"
              target="_blank"
              rel="noreferrer"
            >
              <mwc-button>
                ${localize(`settings.hacs_repo`)}
              </mwc-button>
            </a>

            <a
              href="https://github.com/hacs/integration/issues"
              target="_blank"
              rel="noreferrer"
            >
              <mwc-button>
                ${localize(`repository.open_issue`)}
              </mwc-button>
            </a>
          </div>
        </ha-card>
        <hacs-custom-repositories
          .hass=${this.hass}
          .status=${this.status}
          .configuration=${this.configuration}
          .repositories=${this.repositories}
        >
        </hacs-custom-repositories>
        <hacs-hidden-repositories
          .hass=${this.hass}
          .status=${this.status}
          .configuration=${this.configuration}
          .repositories=${this.repositories}
        >
        </hacs-hidden-repositories>
      </hacs-body>
    `;
  }
  disabledAction() {
    swal(localize("confirm.bg_task"), { buttons: [localize("confirm.ok")] });
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
    this.hass.connection.sendMessage({
      type: "hacs/settings",
      action: "reload_data"
    });
  }

  UpgradeAll() {
    var elements: Repository[] = [];
    this.repositories.forEach(element => {
      if (element.pending_upgrade) elements.push(element);
    });
    if (elements.length > 0) {
      var msg = localize(`confirm.upgrade_all`) + "\n\n";
      elements.forEach(element => {
        msg += `${element.name}: ${element.installed_version} -> ${element.available_version}\n`;
      });
      swal(msg, {
        buttons: [localize("confirm.cancel"), localize("confirm.yes")]
      }).then(value => {
        if (value !== null) {
          this.hass.connection.sendMessage({
            type: "hacs/settings",
            action: "upgrade_all"
          });
        }
      });
    } else {
      swal(localize(`confirm.no_upgrades`), {
        buttons: [localize("confirm.ok")]
      });
    }
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`
        ha-switch {
          margin-bottom: 8px;
        }
        mwc-button {
          margin: 0 8px 0 8px;
        }
      `
    ];
  }
}
