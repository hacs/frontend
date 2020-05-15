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
import { Route } from "../data/common";
import { classMap } from "lit-html/directives/class-map";

@customElement("hacs-single-page-layout")
export class HacsSinglePageLayout extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ type: Boolean }) public isWide = false;
  @property() public header?: string;
  @property() public intro?: string;

  protected render(): TemplateResult | void {
    return html`
      <div
        class="content ${classMap({
          narrow: !this.isWide,
        })}"
      >
        <div class="header-group">
          ${this.narrow
            ? html`<ha-menu-button
                .hass=${this.hass}
                .narrow=${this.narrow}
              ></ha-menu-button>`
            : ""}

          <div class="header">${this.header || ""}</div>
        </div>
        <div
          class="together layout ${classMap({
            narrow: !this.isWide,
            vertical: !this.isWide,
            horizontal: this.isWide,
          })}"
        >
          <div class="intro">${this.intro || ""}</div>
          <div class="panel flex-auto"><slot></slot></div>
        </div>
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
      }
      .header-group {
        display: flex;
        align-items: center;
      }
      .content {
        padding: 28px 20px 0;
        max-width: 1040px;
        margin: 0 auto;
      }
      .layout {
        display: flex;
      }
      .horizontal {
        flex-direction: row;
      }
      .vertical {
        flex-direction: column;
      }
      .flex-auto {
        flex: 1 1 auto;
      }
      .header {
        font-family: var(--paper-font-headline_-_font-family);
        -webkit-font-smoothing: var(
          --paper-font-headline_-_-webkit-font-smoothing
        );
        font-size: var(--paper-font-headline_-_font-size);
        font-weight: var(--paper-font-headline_-_font-weight);
        letter-spacing: var(--paper-font-headline_-_letter-spacing);
        line-height: var(--paper-font-headline_-_line-height);
        opacity: var(--dark-primary-opacity);
      }
      .together {
        margin-top: 32px;
      }
      .intro {
        font-family: var(--paper-font-subhead_-_font-family);
        -webkit-font-smoothing: var(
          --paper-font-subhead_-_-webkit-font-smoothing
        );
        font-weight: var(--paper-font-subhead_-_font-weight);
        line-height: var(--paper-font-subhead_-_line-height);
        width: 100%;
        max-width: 400px;
        margin-right: 40px;
        opacity: var(--dark-primary-opacity);
        font-size: 14px;
        padding-bottom: 20px;
      }
      .panel {
        margin-top: -24px;
      }
      .panel ::slotted(*) {
        margin-top: 24px;
        display: block;
      }
      .narrow.content {
        max-width: 640px;
      }
      .narrow .together {
        margin-top: 0;
      }
      .narrow .intro {
        padding-bottom: 20px;
        margin-right: 0;
        max-width: 500px;
      }
      ha-menu-button {
        --app-header-background-color: var(--primary-background-color);
      }
    `;
  }
}
