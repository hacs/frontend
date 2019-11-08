import { LitElement, customElement, CSSResultArray, css, TemplateResult, html, property } from "lit-element";
import { HacsStyle } from "../style/hacs-style"
import { Repository } from "../types";
import { AddedToLovelace } from "./AddedToLovelace"
import { HomeAssistant } from "custom-card-helpers";
import { LovelaceConfig } from "../misc/LovelaceTypes"
import "../buttons/HacsButtonAddToLovelace"

@customElement("hacs-repository-banner-note")
export class RepositoryBannerNote extends LitElement {
    @property() public hass!: HomeAssistant;
    @property() public repository!: Repository;
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
        else if (this.repository.category == "integration") {
            if (!this.hass.config.components.includes(this.repository.domain)) {
                type = "warning";
                title = "Not Loaded"
                message = `
                This integration is not loaded in Home Assistant.
                `
            }
        }

        else if (this.repository.category == "plugin") {
            if (this.lovelaceconfig !== undefined) {
                var loaded: boolean = AddedToLovelace(this.repository, this.lovelaceconfig);

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
                    <hacs-button-add-to-lovelace .hass=${this.hass} .repository=${this.repository} .lovelaceconfig=${this.lovelaceconfig}>
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
                background-color: var(--hacs-status-pending-restart);
                color: var(--text-primary-color);
            }
            .warning {
                background-color: var(--hacs-status-pending-update)
                color: var(--text-primary-color);
            }
            .info {

            }
        `]
    }
}