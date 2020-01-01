import {
  LitElement,
  customElement,
  CSSResultArray,
  css,
  TemplateResult,
  html,
  property,
  query
} from "lit-element";
import { Configuration, RepositoryData } from "../types";
import { HacsStyle } from "../style/hacs-style";
import { HomeAssistant } from "custom-card-helpers";
import { localize } from "../localize/localize";
import { GFM } from "../markdown/styles";

@customElement("hacs-lovelace-hint")
export class LoveLaceHint extends LitElement {
  @property({ type: Object }) public configuration!: Configuration;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public repository!: RepositoryData;
  @query("#LovelaceExample") private hint!: any;

  protected render(): TemplateResult | void {
    const pluginpath = `${this.repository.full_name.split("/")[1]}/${
      this.repository.file_name
    }`;
    const plugintype = `${
      this.repository.javascript_type !== undefined
        ? this.repository.javascript_type
        : localize(`repository.lovelace_no_js_type`)
    }`;
    return html`
      <div class="lovelace-hint markdown-body">
        <p class="example-title">
          ${localize(`repository.lovelace_instruction`)}:
        </p>
        <pre id="LovelaceExample" class="yaml">
  - url: /community_plugin/${pluginpath}
    type: ${plugintype}</pre
        >

        <paper-icon-button
          title="${localize(`repository.lovelace_copy_example`)}"
          icon="mdi:content-copy"
          id="CopyLLExample"
          @click="${this.CopyToLovelaceExampleToClipboard}"
          role="button"
        ></paper-icon-button>
      </div>
    `;
  }

  CopyToLovelaceExampleToClipboard() {
    navigator.clipboard.writeText(this.hint.innerText);
  }
  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      GFM,
      css`
        .example-title {
          margin-block-end: 0em;
        }
        .yaml {
          display: inline-flex;
          width: calc(100% - 46px);
        }
      `
    ];
  }
}
