import {
  LitElement,
  customElement,
  property,
  html,
  css,
  TemplateResult,
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";
import { Route } from "../data/common";
import { localize } from "../localize/localize";

@customElement("hacs-tabbed-layout")
export class HacsTabbedLayout extends LitElement {
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public route!: Route;
  @property() public selected: string;
  @property() public tabs: any;

  private _ChangeTabAction(tab: string) {
    window.scrollTo(0, 0);
    this.selected = tab;
    this.route.path = `/${tab}`;
    this.dispatchEvent(
      new CustomEvent("hacs-location-changed", {
        detail: { route: this.route },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render(): TemplateResult | void {
    return html`
      <div class="main">
        <div class="toolbar">
        <ha-icon-button icon="mdi:chevron-left" @click=${
          this._goBack
        }></ha-icon-button>
          <div id="tabbar">
            ${this.tabs.map(
              (tab) => html`
                <div
                  class="${this.selected === tab.id
                    ? "toolbar-button selected"
                    : "toolbar-button"}"
                  @click=${() => this._ChangeTabAction(tab.id)}
                >
                  ${localize(`sections.${tab.id}.title`)}
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

  private _goBack(): void {
    this.route.path = "";
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
        flex: 1;
        justify-content: center;
      }

      :host(:not([narrow])) #toolbar-icon {
        min-width: 40px;
      }

      .content {
        position: absolute;
        width: 100%;
        height: calc(100% - 65px - 65px);
        overflow-y: auto;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      }
      :host([narrow]) .content {
        height: calc(100% - 128px);
      }
      mwc-select {
        width: calc(100% - 16px);
        margin: 8px;
        --mdc-theme-primary: var(--primary-color);
        --mdc-theme-text-primary-on-background: var(--primary-text-color);
      }
      .log {
        margin: 8px;
        padding: 4px;
        position: relative;
        background: var(
          --ha-card-background,
          var(--paper-card-background-color, white)
        );
        border-radius: var(--ha-card-border-radius, 2px);
        box-shadow: var(
          --ha-card-box-shadow,
          0 2px 2px 0 rgba(0, 0, 0, 0.14),
          0 1px 5px 0 rgba(0, 0, 0, 0.12),
          0 3px 1px -2px rgba(0, 0, 0, 0.2)
        );
        color: var(--primary-text-color);
        display: block;
        transition: all 0.3s ease-out;
      }
      color-log {
        --colorlog-text: var(--primary-text-color);
      }

      .reload {
        z-index: 2;
        position: fixed;
        right: 8px;
        top: 8px;
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
      .name {
        white-space: nowrap;
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
