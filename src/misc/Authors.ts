import { LitElement, customElement, CSSResultArray, css, TemplateResult, html, property } from "lit-element";
import { HacsStyle } from "../style/hacs-style"
import { HomeAssistant } from "custom-card-helpers";
import { localize } from "../localize/localize"

@customElement("hacs-authors")
export class Authors extends LitElement {
    @property() public hass!: HomeAssistant;
    @property() public authors!: [string];

    protected render(): TemplateResult | void {
        if (String(this.authors.length) === "0") return html``
        return html`
            <div class="MobileGrid">
                <p><b>${localize("repository.authors")}: </b>

                    ${this.authors.map(author =>
            html`
                        <a href="https://github.com/${author.replace("@", "")}"
                                target="_blank" rel='noreferrer' class="autors">
                            ${author.replace("@", "")}
                        </a>`)}

                </p>
            </div>
            `;
    }

    static get styles(): CSSResultArray {
        return [HacsStyle, css`
            .autors {
                color: var(--link-color, var(--accent-color));
            }
        `]
    }
}