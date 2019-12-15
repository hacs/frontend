import {
    LitElement,
    CSSResultArray,
    TemplateResult,
    html,
    customElement,
    css,
    property
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";

import { HacsStyle } from "../style/hacs-style"
import { Repository, Status, Configuration, ValueChangedEvent, AllCategories, Route } from "../types"

import "../components/HacsBody"
import "../components/HacsProgressbar"
import { LovelaceConfig } from "../misc/LovelaceTypes"
import { AddedToLovelace } from "../misc/AddedToLovelace"


@customElement("hacs-store")
export class HacsStore extends LitElement {
    @property() public hass!: HomeAssistant;
    @property() public route!: Route;
    @property() public repositories!: Repository[];
    @property() public store!: string;
    @property() public status!: Status;
    @property() public configuration!: Configuration;
    @property() public lovelaceconfig: LovelaceConfig;
    @property() private search: string = "";
    @property() private sort: string = "name";

    StatusAndDescription(repository: Repository): { status: string, description: string } {
        var status = repository.status;
        var description = repository.status_description;

        if (repository.installed && !this.status.background_task) {
            if (repository.category === "plugin" && !AddedToLovelace(repository, this.lovelaceconfig, this.status)) {
                status = "not-loaded";
                description = "Not loaded in lovelace";
            }
        }

        return { status: status, description: description }
    }


    ShowRepository(ev) {
        var RepoID: string

        ev.composedPath().forEach((item: any) => {
            if (item.RepoID) {
                RepoID = item.RepoID;
            }
        })
        this.route.path = `/repository/${RepoID}`
        this.dispatchEvent(new CustomEvent('hacs-location-change', {
            detail: { value: this.route },
            bubbles: true,
            composed: true
        }));
    }

    render_card(repository: Repository) {
        return html`
        <ha-card @click="${this.ShowRepository}" .RepoID="${repository.id}"
            class="${(this.configuration.frontend_compact ? "compact" : "")}">
            <div class="card-content">
            <div>
            <ha-icon
                icon=${(repository.new ? "mdi:new-box" : "mdi:cube")}
                class="${this.StatusAndDescription(repository).status}"
                title="${this.StatusAndDescription(repository).description}"
                >
            </ha-icon>
            <div>
                <div class="title">${repository.name}</div>
                <div class="addition">${repository.description}</div>
            </div>
            </div>
            </div>
        </ha-card>
        `;
    }

    SortRepo(a: Repository, b: Repository): boolean {

        if (this.sort === "stars") return a.stars < b.stars
        if (this.sort === "status") return a.status < b.status

        return a[this.sort] > b[this.sort];
    }

    SetSortKey(ev: ValueChangedEvent) {
        if (ev.detail.value.length === 0) return;
        this.sort = ev.detail.value.replace(" ", "_").toLowerCase()
        localStorage.setItem("hacs-sort", this.sort);
    }

    DoSearch(ev) {
        this.search = ev.composedPath()[0].value.toLowerCase();

        localStorage.setItem("hacs-search", this.search);
    };

    clearSearch() {
        this.search = "";
        localStorage.setItem("hacs-search", this.search);
    }

    protected render(): TemplateResult | void {
        if (this.repositories === undefined) return html`
            <hacs-progressbar></hacs-progressbar>
        `
        var new_repositories = [];

        var repositories = this.repositories.filter(repository => {
            if (repository.category === this.store) {
                if (repository.id === "172733314") return false;
                if (repository.new) new_repositories.push(repository);
                if (this.search !== "") {
                    if (repository.name.toLowerCase().includes(this.search)) return true;
                    if (repository.description.toLowerCase().includes(this.search)) return true;
                    if (repository.full_name.toLowerCase().includes(this.search)) return true;
                    if (String(repository.authors).toLowerCase().includes(this.search)) return true;
                    if (String(repository.topics).toLowerCase().includes(this.search)) return true;
                    return false;
                }
                return true
            }
            return false
        })

        return html`
        <hacs-body>

            <div class="store-top">
            <paper-input class="search-bar padder" type="text" id="Search" @input=${this.DoSearch}
            placeholder="  ${this.hass.localize("component.hacs.store.placeholder_search")}."
            autofocus .value=${this.search}>
            ${(this.search.length > 0 ? html`
                <ha-icon slot="suffix" icon="mdi:close" @click="${this.clearSearch}"></ha-icon>
            ` : "")}
            </paper-input>
            <paper-dropdown-menu @value-changed="${this.SetSortKey}" class="sort padder" label="Sort">
            <paper-listbox slot="dropdown-content" selected="${this.sort}" attr-for-selected="key">
                <paper-item key="name">Name</paper-item>
                <paper-item key="stars">Stars</paper-item>
                <paper-item key="status">Status</paper-item>
            </paper-listbox>
            </paper-dropdown-menu>
            </div>

            ${(new_repositories.length !== 0 ? html`
            <div class="card-group">
            <div class="leftspace grouptitle">
                New repositories
            </div>
                ${(new_repositories.map(repository => {
            return this.render_card(repository)
        }))}
            </div>
            <hr noshade>
            ` : "")}

                <div class="card-group">
                    ${repositories.sort((a, b) => (this.SortRepo(a, b)) ? 1 : -1).map(repository => { return this.render_card(repository) })}
                </div>
        </hacs-body>
        `
    }

    static get styles(): CSSResultArray {
        return [
            HacsStyle,
            css`
            .loader {
                background-color: var(--primary-background-color);
                height: 100%;
                width: 100%;
              }
              ha-card {
                display: inline-flex;
                cursor: pointer;
              }
              .padder {
                padding-left: 8px;
                padding-right: 8px;
              }
                .search-bar {
                  display: block;
                  width: 60%;
                  background-color: var(--primary-background-color);
                  color: var(--primary-text-color);
                  line-height: 32px;
                  border-color: var(--dark-primary-color);
                  border-width: inherit;
                  border-bottom-width: thin;
                  border-radius: var(--ha-card-border-radius)
                }

                .sort {
                  display: block;
                  width: 30%;
                  margin-left: 10%;
                  background-color: var(--primary-background-color);
                  color: var(--primary-text-color);
                  line-height: 32px;
                  border-color: var(--dark-primary-color);
                  border-width: inherit;
                  border-bottom-width: thin;
                  border-radius: var(--ha-card-border-radius)
                }

                .store-top {
                  display: flex;
                  max-width 100%;
                }
            `]
    }
}