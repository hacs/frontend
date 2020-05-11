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
import { Route } from "../data/common";

import "../layout/hacs-single-page-layout";
//import "../components/hacs-link";

@customElement("hacs-entry-panel")
export class HacsEntryPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;

  protected render(): TemplateResult | void {
    return html`
      <hacs-single-page-layout
        .hass=${this.hass}
        .route=${this.route}
        .narrow=${this.narrow}
        header="Home Assistant Community Store"
        intro="Lorem ipsum"
      >
        <ha-card>
          <a href="#" aria-role="option" tabindex="-1">
            <paper-icon-item>
              <ha-icon icon="mdi:store" slot="item-icon"></ha-icon>
              <paper-item-body two-line>
                Core
                <div secondary>
                  This is where you find custom component/integrations and
                  python_scripts
                </div>
              </paper-item-body>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </paper-icon-item>
          </a>
          <a href="#" aria-role="option" tabindex="-1">
            <paper-icon-item>
              <ha-icon icon="mdi:robot" slot="item-icon"></ha-icon>
              <paper-item-body two-line>
                Automation
                <div secondary>
                  This is where you find AppDaemon and NetDaemon apps
                </div>
              </paper-item-body>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </paper-icon-item>
          </a>
          <a href="#" aria-role="option" tabindex="-1">
            <paper-icon-item>
              <ha-icon icon="mdi:palette" slot="item-icon"></ha-icon>
              <paper-item-body two-line>
                Frontend
                <div secondary>
                  This is where you find lovelace elements and themes
                </div>
              </paper-item-body>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </paper-icon-item>
          </a>
          <a href="#" aria-role="option" tabindex="-1">
            <paper-icon-item>
              <ha-icon icon="mdi:cogs" slot="item-icon"></ha-icon>
              <paper-item-body two-line>
                Settings
                <div secondary>
                  This is where you can manage HACS
                </div>
              </paper-item-body>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </paper-icon-item>
          </a>
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
        padding: 12px;
      }
      .iron-selected paper-item::before,
      a:not(.iron-selected):focus::before {
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
        padding: 4px 0;
      }
      a:not(.iron-selected):focus::before {
        background-color: currentColor;
        opacity: var(--dark-divider-opacity);
      }
      .iron-selected paper-item:focus::before,
      .iron-selected:focus paper-item::before {
        opacity: 0.2;
      }

      paper-item-body {
        -webkit-font-smoothing: var(
          --paper-font-headline_-_-webkit-font-smoothing
        );
        width: 100%;
        font-size: calc(var(--paper-font-headline_-_font-size) - 4px);
        line-height: var(--paper-font-headline_-_line-height);
        opacity: var(--dark-primary-opacity);
      }
      paper-item-body div {
        -webkit-font-smoothing: var(
          --paper-font-subhead_-_-webkit-font-smoothing
        );
        font-weight: var(--paper-font-subhead_-_font-weight);
        line-height: 16px;
        opacity: var(--dark-primary-opacity);
        font-size: 14px;
      }
    `;
  }
}
