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

@customElement("hacs-fab")
export class HacsFab extends LitElement {
  @property() private extended: boolean = false;
  @property({ type: Object }) public hacs!: HACS;
  protected render(): TemplateResult | void {
    return html`
      <ha-icon
        title="More actions"
        class="float ${this.extended ? "extended" : ""}"
        icon="mdi:${this.extended ? "menu-open" : "menu"}"
        @click=${this.toggleFab}
      >
      </ha-icon>
      <paper-listbox
        class="list ${this.extended ? "extended" : ""}"
        slot="dropdown-content"
        selected="-1"
      >
        <div @click=${this.openHelp} class="item">
          <div class="text">${this.hacs.localize("common.documentation")}</div>
          <div><ha-icon icon="mdi:help" class="icon"></ha-icon></div>
        </div>
      </paper-listbox>
    `;
  }

  toggleFab() {
    this.extended = !this.extended;
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
          background: rgba(0, 0, 0, 0);
        }
        ha-icon {
          width: 24px;
          height: 24px;
          padding: 8px;
          border-radius: 50px;
          border: 4px solid var(--accent-color);
          text-align: center;
          color: var(--primary-background-color);
          background-color: var(--accent-color);
        }

        ha-icon.extended {
          -webkit-transform: rotate(90deg);
          -moz-transform: rotate(90deg);
          -o-transform: rotate(90deg);
          -ms-transform: rotate(90deg);
          transform: rotate(90deg);
        }
        .extended {
          display: block !important;
        }
        .list {
          width: fit-content;
          right: 32px;
          position: fixed;
          bottom: 72px;
          display: none;
        }
        .float {
          position: fixed;
          bottom: 24px;
          right: 24px;
          cursor: pointer;
        }

        .item {
          line-height: 48px;
          cursor: pointer;
          display: flex;
          height: 48px;
          margin: 8px;
          align-items: center;
          justify-content: flex-end;
        }
        .icon {
          margin-right: 0px;
        }

        .text {
          padding: 8px;
          border-radius: 50px;
          margin-right: -16px;
          padding-right: 21px;
          height: 12px;
          line-height: 12px;
          border: 1px solid
            var(
              --paper-listbox-background-color,
              var(--primary-background-color)
            );
          background-color: var(
            --paper-listbox-background-color,
            var(--primary-background-color)
          );
        }
      `
    ];
  }
}
