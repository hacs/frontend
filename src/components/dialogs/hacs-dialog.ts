import {
  css,
  CSSResultArray,
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";
import { HacsCommonStyle } from "../../styles/hacs-common-style";

@customElement("hacs-dialog")
export class HacsDialog extends LitElement {
  @property() public active: boolean = false;

  protected render(): TemplateResult | void {
    if (!this.active) {
      return html``;
    }
    return html`
      <div class="backdrop" @click=${this._close}>
        <ha-card class="dialog">
          <div class="header"><slot name="header"></slot></div>
          <ha-icon-button
            class="close"
            icon="mdi:close"
            @click=${this._close}
          ></ha-icon-button>
          <div class="card-content">
            <slot></slot>
          </div>
        </ha-card>
      </div>
    `;
  }

  private _close() {
    this.active = false;
  }

  static get styles(): CSSResultArray {
    return [
      HacsCommonStyle,
      css`
        .close {
          position: absolute;
          top: 0;
          right: 0;
        }
        .backdrop {
          background-color: rgba(0, 0, 0, 0.75);
          width: 100%;
          height: 100%;
          position: fixed;
          z-index: 1;
          top: 0;
          left: 0;
        }

        .dialog {
          z-index: 2;
          left: 10%;
          top: 5%;
          height: 100;
          margin: auto;
          width: 76%;
        }
      `,
    ];
  }
}
