import {
  LitElement,
  customElement,
  property,
  CSSResultArray,
  css,
  TemplateResult,
  html
} from "lit-element";
import { HacsStyle } from "../style/hacs-style";
import { HomeAssistant } from "custom-card-helpers";
import { HACS } from "../Hacs";
import { Repository } from "../types";

@customElement("hacs-hidden-repositories")
export class HiddenRepositories extends LitElement {
  @property({ type: Array }) public _hidden!: Repository[];
  @property({ type: Object }) public hacs!: HACS;
  @property({ type: Object }) public hass!: HomeAssistant;

  UnHide(ev) {
    var repo = ev.composedPath()[4].repoID;
    this.hacs.RepositoryWebSocketAction(this.hass, repo, "unhide");
  }

  protected render(): TemplateResult | void {
    if (this.hacs.repositories === undefined) {
      this.dispatchEvent(
        new CustomEvent("hacs-recreate", { bubbles: true, composed: true })
      );
      return html``;
    }

    this._hidden = this.hacs.repositories.filter(function(repo) {
      return repo.hide;
    });

    if (this._hidden.length === 0) return html``;

    return html`
      <ha-card
        header="${this.hacs
          .localize("settings.hidden_repositories")
          .toUpperCase()}"
      >
        <div class="card-content">
          <div class="custom-repositories-list">
            ${this._hidden
              .sort((a, b) => (a.full_name > b.full_name ? 1 : -1))
              .map(
                repo =>
                  html`
                    <div class="row" .repoID=${repo.id}>
                      <paper-item>
                        <ha-icon
                          title="${this.hacs.localize("settings.unhide")}"
                          class="listicon"
                          icon="mdi:restore"
                          @click=${this.UnHide}
                        ></ha-icon>
                        ${repo.full_name}
                      </paper-item>
                    </div>
                  `
              )}
          </div>
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`
        paper-item {
          display: flex;
        }
        .listicon {
          color: var(--primary-color);
          left: 0px;
        }
      `
    ];
  }
}
