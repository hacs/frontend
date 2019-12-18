import { html } from "lit-element";

import {
  Configuration,
  Repository,
  Status,
  Route,
  LovelaceConfig
} from "../types";
import { AddedToLovelace } from "../misc/AddedToLovelace";
import emoji from "node-emoji";

export class OviewItemBuilder {
  configuration: Configuration;
  lovelaceconfig: LovelaceConfig;
  status: Status;
  route: Route;
  dispatchEvent: any;

  constructor(
    configuration: Configuration,
    lovelaceconfig: LovelaceConfig,
    status: Status,
    route: Route
  ) {
    this.configuration = configuration;
    this.lovelaceconfig = lovelaceconfig;
    this.status = status;
    this.route = route;
  }

  render_card(repository: Repository) {
    return html`
      <ha-card
        @click="${this.ShowRepository}"
        .RepoID="${repository.id}"
        class="${this.configuration.frontend_compact ? "compact" : ""}"
      >
        <div class="card-content">
          <div>
            <ha-icon
              icon=${repository.new ? "mdi:new-box" : "mdi:cube"}
              class="${this.StatusAndDescription(repository).status}"
              title="${this.StatusAndDescription(repository).description}"
            >
            </ha-icon>
            <div class="title">${emoji.emojify(repository.name || "")}</div>
            <div class="addition">
              ${emoji.emojify(repository.description || "")}
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  render_list_line(repository: Repository) {
    return html`
      <paper-item
        .RepoID=${repository.id}
        @click="${this.ShowRepository}"
        class="${this.configuration.frontend_compact ? "compact" : ""}"
      >
        <div class="icon">
          <ha-icon
            icon="mdi:new-box"
            class="${this.StatusAndDescription(repository).status}"
            title="${this.StatusAndDescription(repository).description}"
          >
          </ha-icon>
        </div>
        <paper-item-body two-line>
          <div>
            ${emoji.emojify(repository.name || "")}
            ${this.route.path === "/installed"
              ? html`
                  <div class="MobileHide right flexy">
                    <div>${repository.installed_version}</div>
                    &nbsp; (
                    <div
                      class="${repository.pending_upgrade
                        ? this.StatusAndDescription(repository).status
                        : ""}"
                    >
                      ${repository.available_version}
                    </div>
                    )
                  </div>
                `
              : ""}
          </div>
          <div class="addition">
            ${emoji.emojify(repository.description || "")}
          </div>
        </paper-item-body>
      </paper-item>
    `;
  }

  render(repository: Repository) {
    if (this.configuration.frontend_mode === "Grid")
      return this.render_card(repository);
    return this.render_list_line(repository);
  }

  ShowRepository(ev: {
    composedPath: () => { forEach: (arg0: (item: any) => void) => void };
  }) {
    var RepoID: string;

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

  StatusAndDescription(
    repository: Repository
  ): { status: string; description: string } {
    var status = repository.status;
    if (this.status.startup && repository.installed) status = "installed";
    var description = repository.status_description;

    if (repository.installed && !this.status.background_task) {
      if (
        repository.category === "plugin" &&
        !AddedToLovelace(repository, this.lovelaceconfig, this.status)
      ) {
        status = "not-loaded";
        description = "Not loaded in lovelace";
      }
    }

    return { status: status, description: description };
  }
}
