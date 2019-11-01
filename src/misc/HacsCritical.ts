import { LitElement, customElement, CSSResultArray, css, TemplateResult, html, property } from "lit-element";
import { HacsStyle } from "../style/hacs-style"
import { HomeAssistant } from "custom-card-helpers";
import { Critical } from "../types"

@customElement("hacs-critical")
export class HacsCritical extends LitElement {
    @property() public hass!: HomeAssistant;
    @property() public critical!: Critical[];

    async Acknowledge(ev) {
        var repository = ev.composedPath()[3].repository
        console.log(repository);
        const resp = await this.hass.connection.sendMessagePromise({
            type: "hacs/critical",
            repository: repository
        })
        this.critical = (resp as any).data
    }

    protected render(): TemplateResult | void {
        if (this.critical === undefined) return html``

        var _critical: Critical[] = []

        this.critical.forEach(element => {
            if (!element.acknowledged) _critical.push(element)
        });

        return html`
            ${_critical.map(repo =>
            html`
                <ha-card header="Critical Issue!" class="alert">
                <div class="card-content">
                    The repository "${repo.repository}" has been flagged as a critical repository.</br>
                    The repository has now been uninstalled and removed.</br>
                    For information about how and why these are handled, see
                    <a href="https://hacs.xyz/maintainers/critical">https://hacs.xyz/maintainers/critical</a></br>
                    As a result of this Home Assistant was also restarted.</br></br>
                    <b>Reason: </b>${repo.reason}
                </div>
            <div class="card-actions">
                <mwc-button @click=${this.Acknowledge} .repository=${repo.repository}>
                    Acknowledge
                </mwc-button>
            <a href="${repo.link}" rel='noreferrer' target="_blank">
                <mwc-button>
                    More information about this incident
                </mwc-button>
            </a>
            </div>
            </ha-card>`
        )}
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
        `]
    }
}