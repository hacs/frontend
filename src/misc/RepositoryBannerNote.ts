import { LitElement, customElement, CSSResultArray, css, TemplateResult, html, property } from "lit-element";
import { HacsStyle } from "../style/hacs-style"
import { Repository } from "../types";
import { HomeAssistant } from "custom-card-helpers";

@customElement("hacs-repository-banner-note")
export class RepositoryBannerNote extends LitElement {
    @property() public hass!: HomeAssistant;
    @property() public repository!: Repository;

    @property() private LLConfig: any;

    protected firstUpdated() {
        if (!this.repository.installed) return
        this.hass.connection.sendMessagePromise({
            type: 'lovelace/config', force: false
        }).then(
            (resp) => {
                this.LLConfig = resp;
            },
            () => {
                this.LLConfig = undefined;
            }
        );
    }

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
            if (this.LLConfig !== undefined) {
                var loaded: boolean = false;
                var URL: string = `/community_plugin/${this.repository.full_name.split("/")[1]}/${this.repository.file_name}`;

                (this.LLConfig.resources as [any]).forEach((item: any) => {
                    if (item.url === URL) {
                        loaded = true
                    }
                })

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
        return html`
            <ha-card header="${title}" class="${type}">
                <div class="card-content">
                    ${message}
                </div>
            </ha-card>
            `;
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