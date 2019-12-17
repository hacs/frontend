import {
  LitElement,
  customElement,
  CSSResultArray,
  css,
  TemplateResult,
  html,
  property
} from "lit-element";
import { HacsStyle } from "../style/hacs-style";
import { HomeAssistant } from "custom-card-helpers";
import { localize } from "../localize/localize";

@customElement("hacs-authors")
export class Authors extends LitElement {
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Array }) public authors!: [string];

  protected render(): TemplateResult | void {
    if (String(this.authors.length) === "0") return html``;
    let authors = [];
    const seperateElement = document.createElement("div");
    seperateElement.className = "seperator";
    seperateElement.innerText = ",";
    this.authors.forEach(author => {
      const authorElement = document.createElement("a");
      authorElement.href = `https://github.com/${author.replace("@", "")}`;
      authorElement.target = "_blank";
      authorElement.className = "author";
      authorElement.innerText = author.replace("@", "");
      authors.push(authorElement);
      authors.push(seperateElement);
    });
    authors.pop();
    return html`
      <div>
        <p>
        <div class="authors">
          <b>${localize("repository.authors")}: </b>
          ${authors}
          </div>
        </p>
      </div>
    `;
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`
        .author {
          color: var(--link-text-color, var(--accent-color));
          margin-left: 4px;
        }
        .authors {
          display: flex;
        }
      `
    ];
  }
}
