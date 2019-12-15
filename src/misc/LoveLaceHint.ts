import { LitElement, customElement, CSSResultArray, css, TemplateResult, html, property } from "lit-element";
import { Configuration, Repository } from "../types"
import { HacsStyle } from "../style/hacs-style"
import { HomeAssistant } from "custom-card-helpers";
import { localize } from "../localize/localize"
import { GFM } from '../markdown/styles';

@customElement("hacs-lovelace-hint")
export class LoveLaceHint extends LitElement {
    @property() public hass!: HomeAssistant;
    @property() public configuration!: Configuration;
    @property() public repository!: Repository;

    protected render(): TemplateResult | void {
        return html`
            <div class="lovelace-hint markdown-body">
                <p class="example-title">${localize(`repository.lovelace_instruction`)}:</p>
                <pre id="LovelaceExample" class="yaml">
  - url: /community_plugin/${this.repository.full_name.split("/")[1]}/${this.repository.file_name}
    type: ${(this.repository.javascript_type !== undefined
                ? html`${this.repository.javascript_type}`
                : html`${localize(`repository.lovelace_no_js_type`)}`)}</pre>

                <paper-icon-button
                    title="${localize(`repository.lovelace_copy_example`)}"
                    icon="mdi:content-copy"
                    @click="${this.CopyToLovelaceExampleToClipboard}"
                    role="button"
                ></paper-icon-button>
            </div>
            `;
    }

    CopyToLovelaceExampleToClipboard(ev: any) {
        var LLConfig = ev.composedPath()[4].children[0].children[1].innerText;

        document.addEventListener('copy', (e: ClipboardEvent) => {
            e.clipboardData.setData('text/plain', (LLConfig));
            e.preventDefault();
            document.removeEventListener('copy', null);
        });
        document.execCommand('copy');
    }
    static get styles(): CSSResultArray {
        return [HacsStyle, GFM, css`
            .lovelace-hint {

            }
            .example-title {
                margin-block-end: 0em;
            }
            .yaml {
                display: inline-flex;
                width: calc(100% - 46px);
            }

        `]
    }
}