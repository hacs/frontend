import { HomeAssistant } from "custom-card-helpers";
import {
  LitElement,
  customElement,
  CSSResultArray,
  css,
  TemplateResult,
  html,
  property
} from "lit-element";
import { HacsStyle } from "../style/hacs-style";

import { HACS } from "../Hacs";

import { step_0 } from "./onboarding/step0";
import { step_1 } from "./onboarding/step1";

@customElement("hacs-onboarding")
export class HacsOnboarding extends LitElement {
  @property({ type: Boolean }) public narrow!: boolean;
  @property({ type: Object }) public hacs!: HACS;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property() private step: number = 0;

  NextStep() {
    this.step += 1;
  }

  protected render(): TemplateResult | void {
    return html`
      <app-header-layout has-scrolling-region>
        <app-header slot="header" fixed>
          <app-toolbar>
            <ha-menu-button
              .hass="${this.hass}"
              .narrow="${this.narrow}"
            ></ha-menu-button>
            <div main-title>
              Home Assistant Community Store
            </div>
          </app-toolbar>
        </app-header>
        <hacs-body>
          <ha-card>
            <div class="card-content">
              ${this.step === 0 ? step_0 : ""} ${this.step === 1 ? step_1 : ""}
            </div>
            <div class="card-actions">
              <mwc-button
                raised
                title="${this.hacs.localize("common.continue")}"
                @click=${this.NextStep}
              >
                ${this.hacs.localize("common.continue")}
              </mwc-button>
            </div>
          </ha-card>
        </hacs-body>
      </app-header-layout>
    `;
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`
        mwc-button {
          display: grid;
        }
      `
    ];
  }
}
