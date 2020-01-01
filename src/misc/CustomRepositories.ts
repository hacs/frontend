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

import { HacsStyle } from "../style/hacs-style";
import { HACS } from "../Hacs";
import { Route, RepositoryData } from "../types";

@customElement("hacs-custom-repositories")
export class CustomRepositories extends LitElement {
  @property({ type: Object }) public hacs!: HACS;
  @property({ type: Array }) public custom!: RepositoryData[];
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public route!: Route;

  Delete(ev) {
    let RepoID: string;
    let RepoFullName: string;
    ev.composedPath().forEach((item: any) => {
      if (item.RepoID) {
        RepoID = item.RepoID;
        RepoFullName = item.RepoFullName;
      }
    });
    swal(this.hacs.localize("confirm.delete", "{item}", RepoFullName), {
      buttons: [
        this.hacs.localize("confirm.no"),
        this.hacs.localize("confirm.yes")
      ]
    }).then(value => {
      if (!this.hacs.isnullorempty(value)) {
        this.hacs.RepositoryWebSocketAction(this.hass, RepoID, "delete");
      }
    });
  }

  DeleteInstalled(ev) {
    let RepoFullName: string;
    ev.composedPath().forEach((item: any) => {
      if (item.RepoFullName) {
        RepoFullName = item.RepoFullName;
      }
    });
    swal(
      this.hacs.localize("confirm.delete_installed", "{item}", RepoFullName)
    );
  }

  Save(ev) {
    var selected = ev.composedPath()[2].children[1].selectedItem;
    if (selected === undefined) {
      swal(this.hacs.localize("settings.missing_category"));
      return;
    }
    var category = selected.category;
    var repo = ev.composedPath()[2].children[0].value;
    this.hacs.RepositoryWebSocketAction(this.hass, repo, "add", category);
    swal(
      this.hacs.localize("settings.adding_new_repo", "{repo}", repo) +
        "\n" +
        this.hacs.localize(
          "settings.adding_new_repo_category",
          "{category}",
          category
        )
    );
  }

  ShowRepository(ev: {
    composedPath: () => { forEach: (arg0: (item: any) => void) => void };
  }) {
    let RepoID: string;
    ev.composedPath().forEach((item: any) => {
      if (item.RepoID) {
        RepoID = item.RepoID;
      }
    });
    this.route.path = `/repository/${RepoID}`;
    this.dispatchEvent(
      new CustomEvent("hacs-location-change", {
        detail: { value: this.route },
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

    this.custom = this.hacs.repositories.filter(function(repo) {
      if (!repo.custom) return false;
      return true;
    });

    return html`
      <ha-card header="${this.hacs.localize("settings.custom_repositories")}">
        <div class="card-content">
          <div class="custom-repositories-list">
            ${this.hacs.status.background_task
              ? html`
                  <i class="addition"
                    >${this.hacs.localize("settings.bg_task_custom")}</i
                  >
                `
              : html`
                  ${this.custom
                    .sort((a, b) => (a.full_name > b.full_name ? 1 : -1))
                    .map(
                      repo =>
                        html`
                          <div
                            class="row"
                            .RepoID=${repo.id}
                            .RepoFullName=${repo.full_name}
                          >
                            <paper-item class="customlistitem">
                              <div
                                @click=${this.ShowRepository}
                                class="link flexy"
                                title="${this.hacs.localize(
                                  "settings.open_repository"
                                )}"
                              >
                                <div class="MobileHide">
                                  [${repo.category}]&nbsp;
                                </div>
                                ${repo.full_name}
                              </div>
                              ${repo.installed
                                ? html`
                                    <ha-icon
                                      title="${this.hacs.localize(
                                        "settings.delete"
                                      )}"
                                      class="listicon disabled"
                                      icon="mdi:delete"
                                      @click=${this.DeleteInstalled}
                                    ></ha-icon>
                                  `
                                : html`
                                    <ha-icon
                                      title="${this.hacs.localize(
                                        "settings.delete"
                                      )}"
                                      class="listicon"
                                      icon="mdi:delete"
                                      @click=${this.Delete}
                                    ></ha-icon>
                                  `}
                            </paper-item>
                          </div>
                        `
                    )}
                `}
          </div>
        </div>
        ${this.hacs.status.background_task
          ? ""
          : html`
              <div class="card-actions">
                <paper-input
                  class="inputfield MobileGrid"
                  placeholder=${this.hacs.localize(
                    "settings.add_custom_repository"
                  )}
                  type="text"
                ></paper-input>
                <paper-dropdown-menu
                  class="category MobileGrid"
                  label="${this.hacs.localize(`settings.category`)}"
                >
                  <paper-listbox slot="dropdown-content" selected="-1">
                    ${this.hacs.configuration.categories.map(
                      category => html`
                        <paper-item class="categoryitem" .category=${category}>
                          ${this.hacs.localize(`common.${category}`)}
                        </paper-item>
                      `
                    )}
                  </paper-listbox>
                </paper-dropdown-menu>

                <div class="save">
                  <ha-icon
                    title="${this.hacs.localize("settings.save")}"
                    icon="mdi:content-save"
                    class="saveicon MobileGrid"
                    @click=${this.Save}
                  >
                  </ha-icon>
                </div>
              </div>
            `}
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
          color: var(--hacs-badge-color, --accent-color);
          position: absolute;
          right: 0;
          bottom: 24px;
          cursor: pointer;
        }
        .listicon {
          color: var(--hacs-badge-color, --accent-color);
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
        paper-item.categoryitem {
          display: flex;
          background-color: var(
            --paper-listbox-background-color,
            var(--primary-background-color)
          );
        }

        paper-item.customlistitem {
          display: flex;
        }
      `
    ];
  }
}
