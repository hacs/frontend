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

import { step as onboarding0 } from "./onboarding_steps/0";
import { step as onboarding1 } from "./onboarding_steps/1";
import { step as onboarding2 } from "./onboarding_steps/2";
import { step as onboarding3 } from "./onboarding_steps/3";
import { step as onboarding4 } from "./onboarding_steps/4";
import { step as onboarding5 } from "./onboarding_steps/5";
import { step as onboarding6 } from "./onboarding_steps/6";
import { step as onboarding7 } from "./onboarding_steps/7";
import { step as onboarding8 } from "./onboarding_steps/8";
import { step as onboarding9 } from "./onboarding_steps/9";
import { step as onboarding10 } from "./onboarding_steps/10";
import { step as onboarding11 } from "./onboarding_steps/11";

@customElement("hacs-onboarding")
export class HacsOnboarding extends LitElement {
  @property({ type: Boolean }) public narrow!: boolean;
  @property({ type: Object }) public hacs!: HACS;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property() private step: number = 0;

  NextStep() {
    this.step += 1;
    if (this.step === 12) {
      console.error("We need to stop here!");
    }
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
              ${this.step === 0
                ? onboarding0
                : this.step === 1
                ? onboarding1
                : this.step === 2
                ? onboarding2
                : this.step === 3
                ? onboarding3
                : this.step === 4
                ? onboarding4
                : this.step === 5
                ? onboarding5
                : this.step === 6
                ? onboarding6
                : this.step === 7
                ? onboarding7
                : this.step === 8
                ? onboarding8
                : this.step === 9
                ? onboarding9
                : this.step === 10
                ? onboarding10
                : this.step === 11
                ? onboarding11
                : ""}
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
