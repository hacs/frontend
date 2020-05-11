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
import { HACS } from "../Hacs";
import { RepositoryData } from "../data";

@customElement("hacs-hidden-repositories")
export class HiddenRepositories extends LitElement {
  @property() public _hidden!: RepositoryData[];
  @property() public hacs!: HACS;

  UnHide(ev) {
    var repo = ev.composedPath()[4].repoID;
    this.dispatchEvent(
      new CustomEvent("hacs-repository-action", {
        detail: { repo: repo, action: "unhide" },
        bubbles: true,
        composed: true
      })
    );
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
          color: var(--hacs-badge-color, --accent-color);
          left: 0px;
        }
      `
    ];
  }
}
