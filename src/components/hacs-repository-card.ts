import {
  css,
  CSSResultArray,
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import { HacsCommonStyle } from "../styles/hacs-common-style";
import "../components/dialogs/hacs-repository-info-dialog";
import { Repository } from "../data/common";

@customElement("hacs-repository-card")
export class HacsRepositoryCard extends LitElement {
  @property() public repository!: Repository;
  @property() private showInfoDialog: boolean = false;

  protected render(): TemplateResult | void {
    return html`
      <ha-card
        @click=${this._reopsitoryInfo}
        class="${classMap({
          pending_upgrade: this.repository.pending_upgrade,
        })}"
      >
        <div class="card-content">
          <div class="header">${this.repository.name}</div>
        </div>
        <div class="card-actions"></div>
      </ha-card>
      <hacs-repository-info-dialog
        .repository=${this.repository}
        .active=${this.showInfoDialog}
      ></hacs-repository-info-dialog>
    `;
  }

  private _reopsitoryInfo() {
    this.showInfoDialog = !this.showInfoDialog;
  }

  static get styles(): CSSResultArray {
    return [
      HacsCommonStyle,
      css`
        ha-card {
          height: 100%;
          cursor: pointer;
        }
        .card-content {
          display: flex;
          margin-top: 0;
          text-align: center;
          flex-direction: column;
          justify-content: space-between;
        }
        div .dialog .show {
          display: block;
          background-color: rgba(0, 0, 0, 0.75);
          width: 100%;
          height: 100%;
          position: fixed;
          z-index: 1;
          top: 0;
          left: 0;
        }
        .dialog .hide {
          display: none;
        }
        ha-card.dialog {
          z-index: 2;
        }
      `,
    ];
  }
}
