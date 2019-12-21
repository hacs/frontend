import {
  LitElement,
  CSSResultArray,
  TemplateResult,
  html,
  css,
  customElement,
  property
} from "lit-element";
import { HacsStyle } from "../style/hacs-style";
import { HACS } from "../Hacs";

import swal from "sweetalert";

@customElement("hacs-menu")
export class HacsMenu extends LitElement {
  @property() private extended: boolean = true;
  @property({ type: Object }) public hacs!: HACS;
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
        <paper-icon-button
          icon="hass:dots-vertical"
          slot="dropdown-trigger"
          role="button"
        ></paper-icon-button>
        <paper-listbox slot="dropdown-content" role="listbox" tabindex="0">
          <paper-item @click=${this.openHelp} class="text"
            >${this.hacs.localize("common.documentation")}
          </paper-item>

          <paper-item @click=${this.openAbout} class="text"
            >${this.hacs.localize("common.about")}
          </paper-item>
        </paper-listbox>
      </paper-menu-button>
    `;
  }

  openAbout() {
    swal("About");
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
    this.extended = false;
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`
        paper-listbox {
          top: 0px;
        }
        ha-icon {
          cursor: pointer;
          float: right;
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
