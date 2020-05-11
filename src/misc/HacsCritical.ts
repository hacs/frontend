import {
  LitElement,
  customElement,
  CSSResultArray,
  css,
  TemplateResult,
  html,
  property,
} from "lit-element";
import { HacsStyle } from "../style/hacs-style";
import { HomeAssistant } from "custom-card-helpers";
import { Critical } from "../data";

@customElement("hacs-critical")
export class HacsCritical extends LitElement {
  @property() public critical!: Critical[];
  @property() public hass!: HomeAssistant;

  async Acknowledge(ev) {
    var repository = ev.composedPath()[3].repository;
    const resp = await this.hass.connection.sendMessagePromise({
      type: "hacs/critical",
      repository: repository,
    });
    this.critical = (resp as any).data;
  }

  protected render(): TemplateResult | void {
    if (this.critical === undefined) return html``;

    var _critical: Critical[] = [];

    this.critical.forEach((element) => {
      if (!element.acknowledged) _critical.push(element);
    });

    return html`
      ${_critical.map(
        (repo) =>
          html`
            <ha-card header="Critical Issue!" class="alert">
                <div class="card-content">
                    The repository "${repo.repository}" has been flagged as a critical repository.</br>
                    The repository has now been uninstalled and removed.</br>
                    For information about how and why these are handled, see
                    <hacs-link url="https://hacs.xyz/docs/developer/maintainer#critical-repositories">
                        https://hacs.xyz/docs/developer/maintainer#critical-repositories
                    </hacs-link></br>
                    As a result of this Home Assistant was also restarted.</br></br>

                    <b>Reason: </b>${repo.reason}
                </div>
                <div class="card-actions">
                    <mwc-button @click=${this.Acknowledge} .repository=${repo.repository}>
                        Acknowledge
                    </mwc-button>
                    <hacs-link .url="${repo.link}">
                        <mwc-button>
                            More information about this incident
                        </mwc-button>
                    </hacs-link>
                </div>
            </ha-card>`
      )}
    `;
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`
        ha-card {
          width: 90%;
          margin-left: 5%;
        }
        .alert {
          background-color: var(
            --hacs-status-pending-restart,
            var(--google-red-500)
          );
          color: var(--text-primary-color);
        }
      `,
    ];
  }
}
