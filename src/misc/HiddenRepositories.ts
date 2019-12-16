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

import { Repository } from "../types";
import { RepositoryWebSocketAction } from "./RepositoryWebSocketAction";
import { localize } from "../localize/localize";

@customElement("hacs-hidden-repositories")
export class HiddenRepositories extends LitElement {
  @property({ type: Array }) public repositories!: Repository[];
  @property({ type: Array }) public _hidden!: Repository[];
  @property({ type: Object }) public hass!: HomeAssistant;

  UnHide(ev) {
    var repo = ev.composedPath()[4].repoID;
    RepositoryWebSocketAction(this.hass, repo, "unhide");
  }

  protected render(): TemplateResult | void {
    this._hidden = this.repositories.filter(function(repo) {
      return repo.hide;
    });

    if (this._hidden.length === 0) return html``;

    return html`
      <ha-card
        header="${localize("settings.hidden_repositories").toUpperCase()}"
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
                          title="${localize("settings.unhide")}"
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
        ha-card {
          width: 90%;
          margin-left: 5%;
        }
        .listicon {
          color: var(--primary-color);
          left: 0px;
        }
      `
    ];
  }
}
