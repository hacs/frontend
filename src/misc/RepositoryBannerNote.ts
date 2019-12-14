import { LitElement, customElement, CSSResultArray, css, TemplateResult, html, property } from "lit-element";
import { HacsStyle } from "../style/hacs-style"
import { Repository, Configuration, Status } from "../types";
import { AddedToLovelace } from "./AddedToLovelace"
import { HomeAssistant } from "custom-card-helpers";
import { LovelaceConfig } from "../misc/LovelaceTypes"
import "../buttons/HacsButtonAddToLovelace"

@customElement("hacs-repository-banner-note")
export class RepositoryBannerNote extends LitElement {
    @property() public hass!: HomeAssistant;
    @property() public repository!: Repository;
    @property() public status!: Status;
    @property() public configuration: Configuration;
    @property() public lovelaceconfig: LovelaceConfig;

    protected render(): TemplateResult | void {
        if (!this.repository.installed) return html``
        var message: string = "";
        var title: string = "";
        var type: "alert" | "warning" | "info" | "" = ""

        if (this.repository.status == "pending-restart") {
            type = "alert";
            title = "Restart pending"
            message = `
            You need to restart Home Assistant.
            `
        }

        else if (this.repository.category == "plugin") {
            if (this.lovelaceconfig !== undefined && !this.status.background_task) {
                var loaded: boolean = AddedToLovelace(this.repository, this.lovelaceconfig, this.status);

                if (!loaded) {
                    type = "warning";
                    title = "Not Loaded"
                    message = `
                    This plugin is not added to your Lovelace resources.
                    `
                }
            }
        }
        if (message.length == 0) return html``;
        if (this.repository.category !== "plugin") return html`
            <ha-card header="${title}" class="${type}">
                <div class="card-content">
                    ${message}
                </div>
            </ha-card>
            `;
        return html`
            <ha-card header="${title}" class="${type}">
                <div class="card-content">
                    ${message}
                </div>
                <div class="card-actions">
                    <hacs-button-add-to-lovelace
                        .hass=${this.hass}
                        .configuration=${this.configuration}
                        .repository=${this.repository}
                        .lovelaceconfig=${this.lovelaceconfig}>
                    </hacs-button-add-to-lovelace>
                </div>
            </ha-card>
        `
    }

    static get styles(): CSSResultArray {
        return [HacsStyle, css`
            ha-card {
                width: 90%;
                margin-left: 5%;
            }
            .alert {
                background-color: var(--hacs-status-pending-restart, var(--google-red-500));
                color: var(--text-primary-color);
            }
            .warning {
                background-color: var(--hacs-status-pending-update)
                color: var(--primary-text-color);
            }
            .info {
                background-color: var(--primary-background-color)
                color: var(--primary-text-color);
            }
        `]
    }
}