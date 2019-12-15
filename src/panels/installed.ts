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
import { Repository, Status, Configuration, RepositoryCategories, AllCategories, Route } from "../types"

import "../components/HacsBody"
import "../components/HacsProgressbar"
import { LovelaceConfig } from "../misc/LovelaceTypes"
import { AddedToLovelace } from "../misc/AddedToLovelace"

@customElement("hacs-installed")
export class HacsInstalled extends LitElement {
    @property() public hass!: HomeAssistant;
    @property() public route!: Route;
    @property() public repositories!: Repository[];
    @property() public status!: Status;
    @property() public configuration!: Configuration;
    @property() public lovelaceconfig: LovelaceConfig;

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

    protected render(): TemplateResult | void {
        if (this.repositories === undefined) return html`
            <hacs-progressbar></hacs-progressbar>
        `

        var categories: RepositoryCategories = { integrations: [], plugins: [], appdaemon_apps: [], python_scripts: [], themes: [] }

        var installed_repositories = this.repositories.filter(function (repository) {
            if (repository.installed) {
                if (repository.category === "integration") categories.integrations.push(repository);
                if (repository.category === "plugin") categories.plugins.push(repository);
                if (repository.category === "appdaemon") categories.appdaemon_apps.push(repository);
                if (repository.category === "python_script") categories.python_scripts.push(repository);
                if (repository.category === "theme") categories.themes.push(repository);
                return true;
            }
            return false;
        })

        var updatable_repositories = installed_repositories.filter(function (repository) {
            if (repository.pending_upgrade) return true;
            return false;
        })

        return html`
        <hacs-body>
            ${(updatable_repositories.length !== 0 ? html`
            <div class="card-group">
            <div class="leftspace grouptitle">
                Pending Upgrades
            </div>
                ${(updatable_repositories.sort((a, b) => (a.name, b.name) ? 1 : -1).map(repository => {
            return this.render_card(repository)
        }))}
            </div>
            <hr noshade>
            ` : "")}

            ${(AllCategories.map(category => {
            if (categories[category] === undefined || categories[category].length === 0) return html``;
            return html`
                <div class="card-group">
                    <div class="leftspace grouptitle">
                    ${this.hass.localize(`component.hacs.common.${category}`)}
                    </div>
                    ${categories[category].sort((a, b) => (a.name, b.name) ? 1 : -1).map(repository => {
                return this.render_card(repository)
            })}
                </div>
                        `
        }))}
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
              .grouptitle {
                font-size: larger;
              }

            `]
    }
}