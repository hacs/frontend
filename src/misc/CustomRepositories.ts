import {
  LitElement,
  customElement,
  property,
  CSSResultArray,
  css,
  TemplateResult,
  html
} from "lit-element";
import swal from "sweetalert";
import { HomeAssistant } from "custom-card-helpers";

import { localize } from "../localize/localize";
import { RepositoryWebSocketAction } from "../misc/RepositoryWebSocketAction";
import { HacsStyle } from "../style/hacs-style";
import { isnullorempty } from "../tools";
import { Configuration, Repository, Status } from "../types";

@customElement("hacs-custom-repositories")
export class CustomRepositories extends LitElement {
  @property({ type: Array }) public custom!: Repository[];
  @property({ type: Array }) public repositories!: Repository[];
  @property({ type: Object }) public configuration!: Configuration;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public status!: Status;

  Delete(ev) {
    swal(localize("confirm.delete", "{item}", ev.composedPath()[3].innerText), {
      buttons: [localize("confirm.cancel"), localize("confirm.yes")]
    }).then(value => {
      if (!isnullorempty(value)) {
        var repo = ev.composedPath()[4].repoID;
        RepositoryWebSocketAction(this.hass, repo, "delete");
      }
    });
  }

  Save(ev) {
    var selected = ev.composedPath()[2].children[1].selectedItem;
    if (selected === undefined) {
      swal(localize("settings.missing_category"));
      return;
    }
    var category = selected.category;
    var repo = ev.composedPath()[2].children[0].value;
    swal(repo);
    RepositoryWebSocketAction(this.hass, repo, "add", category);
  }

  protected render(): TemplateResult | void {
    this.custom = this.repositories.filter(function(repo) {
      if (!repo.custom) return false;
      return true;
    });

    return html`
      <ha-card header="${localize("settings.custom_repositories")}">
        <div class="card-content">
          <div class="custom-repositories-list">
            ${this.status.background_task
              ? html``
              : html`
                  ${this.custom
                    .sort((a, b) => (a.full_name > b.full_name ? 1 : -1))
                    .map(
                      repo =>
                        html`
                          <div class="row" .repoID=${repo.id}>
                            <paper-item>
                              ${repo.full_name}
                              <ha-icon
                                title="${localize("settings.delete")}"
                                class="listicon"
                                icon="mdi:delete"
                                @click=${this.Delete}
                              ></ha-icon>
                            </paper-item>
                          </div>
                        `
                    )}
                `}
          </div>
        </div>

        <div class="card-actions">
          <paper-input
            class="inputfield MobileGrid"
            placeholder=${localize("settings.add_custom_repository")}
            type="text"
          ></paper-input>
          <paper-dropdown-menu
            class="category MobileGrid"
            label="${localize(`settings.category`)}"
          >
            <paper-listbox slot="dropdown-content" selected="-1">
              ${this.configuration.categories.map(
                category => html`
                  <paper-item .category=${category}>
                    ${localize(`common.${category}`)}
                  </paper-item>
                `
              )}
            </paper-listbox>
          </paper-dropdown-menu>

          <div class="save">
            <ha-icon
              title="${localize("settings.save")}"
              icon="mdi:content-save"
              class="saveicon MobileGrid"
              @click=${this.Save}
            >
            </ha-icon>
          </div>
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`
        .inputfield {
          width: 60%;
        }
        .category {
          position: absolute;
          width: 30%;
          right: 54px;
          bottom: 5px;
        }
        .saveicon {
          color: var(--primary-color);
          position: absolute;
          right: 0;
          bottom: 24px;
          cursor: pointer;
        }
        .listicon {
          color: var(--primary-color);
          right: 0px;
          position: absolute;
          cursor: pointer;
        }
        .loading {
          position: absolute;
          right: 10px;
          bottom: 22px;
        }

        @media screen and (max-width: 600px) and (min-width: 0) {
          .saveicon {
            height: 64px;
          }
          .save {
            padding-bottom: 64px;
          }
        }
        paper-item {
          display: flex;
          background-color: var(
            --paper-listbox-background-color,
            var(--primary-background-color)
          );
        }
      `
    ];
  }
}
