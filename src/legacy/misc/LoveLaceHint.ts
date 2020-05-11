import {
  LitElement,
  customElement,
  CSSResultArray,
  css,
  TemplateResult,
  html,
  property,
  query,
} from "lit-element";
import { Configuration, RepositoryData } from "../data";
import { HacsStyle } from "../style/hacs-style";
import { HomeAssistant } from "custom-card-helpers";
import { localize } from "../../localize/localize";
import { GFM } from "../markdown/styles";

@customElement("hacs-lovelace-hint")
export class LoveLaceHint extends LitElement {
  @property() public configuration!: Configuration;
  @property() public hass!: HomeAssistant;
  @property() public repository!: RepositoryData;
  @query("#LovelaceExample") private hint!: any;

  protected render(): TemplateResult | void {
    const pluginpath = `${this.repository.full_name.split("/")[1]}/${
      this.repository.file_name
    }`;
    return html`
      <div class="lovelace-hint markdown-body">
        <p class="example-title">
          ${localize(`repository.lovelace_instruction`)}:
        </p>
        <table class="llhint">
          <tr>
            <td>URL:</td>
            <td><code>/hacsfiles/${pluginpath}</code></td>
          </tr>
          <tr>
            <td>Type:</td>
            <td>
              module
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      GFM,
      css`
        .llhint tbody {
          width: 100%;
          display: inline-table;
        }
        .example-title {
          margin-block-end: 0em;
        }
        .yaml {
          display: inline-flex;
          width: calc(100% - 46px);
        }
      `,
    ];
  }
}
