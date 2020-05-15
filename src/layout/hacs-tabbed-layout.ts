import {
  LitElement,
  customElement,
  property,
  html,
  css,
  TemplateResult,
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";
import { classMap } from "lit-html/directives/class-map";
import { Route } from "../data/common";
import { localize } from "../localize/localize";

@customElement("hacs-tabbed-layout")
export class HacsTabbedLayout extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public route!: Route;
  @property({ type: Boolean }) public narrow!: boolean;
  @property() public selected: string;
  @property() public tabs: any;

  protected render(): TemplateResult | void {
    return html`
      <div class="main">
        <div class="toolbar">
        <ha-icon-button icon="mdi:chevron-left" @click=${
          this._goBack
        }></ha-icon-button>
                ${
                  this.narrow
                    ? html`
                        <div class="main-title">
                          ${localize(`sections.${this.selected}.title`)}
                        </div>
                      `
                    : ""
                }
          <div id="tabbar" class=${classMap({ "bottom-bar": this.narrow })}>
            ${this.tabs.map(
              (tab) => html`
                <div
                  class="${classMap({
                    "toolbar-button": true,
                    selected: this.selected === tab.id,
                  })}"
                  @click=${() => this._ChangeTabAction(tab.id)}
                >
                  ${this.narrow
                    ? html`<ha-icon-button .icon=${tab.icon}></ha-icon-button
                        ><span class="name"
                          >${localize(`sections.${tab.id}.title`)}</span
                        >`
                    : localize(`sections.${tab.id}.title`)}
                </div>
              `
            )}
          </div>
          <div id="toolbar-icon">
          <slot name="toolbar-icon"></slot>
          </div>
        </div>
        </div>
        <div class="content"><slot></slot></div>
      </div>
    `;
  }

  private _ChangeTabAction(tab: string) {
    window.scrollTo(0, 0);
    this.selected = tab;
    this.route.path = `/${tab}`;
    this._locationChanged();
  }

  private _goBack(): void {
    this.route.path = "";
    this._locationChanged();
  }

  private _locationChanged(): void {
    this.dispatchEvent(
      new CustomEvent("hacs-location-changed", {
        detail: { route: this.route },
        bubbles: true,
        composed: true,
      })
    );
  }

  static get styles() {
    return css`
      :host {
        display: block;
        height: 100%;
        background-color: var(--primary-background-color);
      }
      ha-menu-button {
        margin-right: 24px;
      }
      .name {
        white-space: nowrap;
      }
      .toolbar {
        display: flex;
        align-items: center;
        font-size: 20px;
        height: 65px;
        background-color: var(--sidebar-background-color);
        font-weight: 400;
        color: var(--sidebar-text-color);
        border-bottom: 1px solid var(--divider-color);
        font-family: var(--paper-font-body1_-_font-family);
        padding: 0 16px;
        box-sizing: border-box;
      }
      .searchbar {
        display: flex;
        align-items: center;
        font-size: 20px;
        top: 65px;
        height: 65px;
        background-color: var(--sidebar-background-color);
        border-bottom: 1px solid var(--divider-color);
        padding: 0 16px;
        box-sizing: border-box;
      }
      #tabbar {
        display: flex;
        font-size: 14px;
      }
      #tabbar.bottom-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        padding: 0 16px;
        box-sizing: border-box;
        background-color: var(--sidebar-background-color);
        border-top: 1px solid var(--divider-color);
        justify-content: space-between;
        z-index: 1;
        font-size: 12px;
        width: 100%;
      }
      #tabbar:not(.bottom-bar) {
        flex: 1;
        justify-content: center;
      }

      :host(:not([narrow])) #toolbar-icon {
        min-width: 40px;
      }
      ha-menu-button,
      ha-icon-button-arrow-prev,
      ::slotted([slot="toolbar-icon"]) {
        flex-shrink: 0;
        pointer-events: auto;
        color: var(--sidebar-icon-color);
      }

      #toolbar-icon {
        float: right;
      }

      .main-title {
        -webkit-font-smoothing: var(
          --paper-font-headline_-_-webkit-font-smoothing
        );
        flex: 1;
        font-family: var(--paper-font-headline_-_font-family);
        font-size: var(--paper-font-headline_-_font-size);
        font-weight: var(--paper-font-headline_-_font-weight);
        letter-spacing: var(--paper-font-headline_-_letter-spacing);
        line-height: 26px;
        max-height: 26px;
        opacity: var(--dark-primary-opacity);
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .content {
        position: relative;
        width: 100%;
        height: calc(100% - 65px);
        overflow-y: auto;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      }

      :host([narrow]) .content {
        height: calc(100% - 128px);
      }

      .toolbar-button {
        padding: 0 32px;
        display: flex;
        flex-direction: column;
        text-align: center;
        align-items: center;
        justify-content: center;
        height: 64px;
        cursor: pointer;
        position: relative;
        outline: none;
        box-sizing: border-box;
      }

      ha-icon-button {
        cursor: pointer;
      }
      .selected {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
      }
      .search-input {
        width: calc(100% - 48px);
        height: 40px;
        border: 0;
        padding: 0 16px;
        font-size: initial;
        color: var(--sidebar-text-color);
        font-family: var(--paper-font-body1_-_font-family);
      }
      input:focus {
        outline-offset: 0;
        outline: 0;
      }
    `;
  }
}
