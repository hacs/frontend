import { LitElement, customElement, CSSResultArray, css, TemplateResult, html, property } from "lit-element";
import { HacsStyle } from "../style/hacs-style"
import { HomeAssistant } from "custom-card-helpers";

@customElement("hacs-error")
export class HacsError extends LitElement {
    @property() public hass!: HomeAssistant;
    @property() public error: { message: string, action: string } = undefined;

    clearError() {
        this.error = undefined;
    }

    protected firstUpdated() {
        this.hass.connection.subscribeEvents(
            (msg) => this.error = (msg as any).data, "hacs/error"
        );
    }

    protected render(): TemplateResult | void {
        if (this.error === undefined) return html``

        var message = this.error.message
        var additional = ""

        if (this.error.action === "add_repository") {
            additional = "Could not add this repository, make sure it is compliant with HACS."
        }

        return html`
            <ha-card header="An error ocoured while prosessing" class="alert">
                <div class="card-content">
                    ${message} </br>
                    ${additional}
                </div>
            <div class="card-actions">
                <mwc-button @click=${this.clearError}>
                    Acknowledge
                </mwc-button>
            ${(this.error.action === "add_repository" ? html`
            <a href="https://hacs.xyz/docs/publish/start" rel='noreferrer' target="_blank">
                <mwc-button>
                    Documentation
                </mwc-button>
            </a>
            ` : "")}
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
                background-color: var(--hacs-status-pending-restart, var(--google-red-500));
                color: var(--text-primary-color);
            }
        `]
    }
}