import {
  LitElement,
  customElement,
  CSSResultArray,
  css,
  TemplateResult,
  html,
  property
} from "lit-element";
import { Configuration, RepositoryData } from "../data";
import { HacsStyle } from "../style/hacs-style";
import { HomeAssistant } from "custom-card-helpers";
import { localize } from "../localize/localize";

interface LoveLaceHint extends HTMLElement {
  hass?: HomeAssistant;
  configuration?: Configuration;
  repository?: RepositoryData;
}

@customElement("hacs-repository-note")
export class RepositoryNote extends LitElement {
  @property() public configuration!: Configuration;
  @property() public hass!: HomeAssistant;
  @property() public repository!: RepositoryData;

  protected render(): TemplateResult | void {
    let path: string = this.repository.local_path;
    if (this.repository.category === "theme") {
      path = `${path}/${this.repository.file_name}`;
    }

    const Note = document.createElement("div");
    Note.className = "repository-note";

    const p = document.createElement("p");
    p.innerText = `${localize(`repository.note_installed`)} '${path}'`;
    if (
      ["appdaemon", "integration", "plugin"].includes(this.repository.category)
    ) {
      p.innerText += `, ${localize(
        `repository.note_${this.repository.category}`
      )}.`;
    }

    Note.appendChild(p);

    if (this.repository.category === "plugin") {
      const LLHint: LoveLaceHint = document.createElement("hacs-lovelace-hint");
      LLHint.hass = this.hass;
      LLHint.configuration = this.configuration;
      LLHint.repository = this.repository;
      Note.appendChild(LLHint);
    }

    return html`
      ${Note}
    `;
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`
        .repository-note {
          border-top: 1px solid var(--primary-text-color);
        }
        p {
          font-style: italic;
        }
      `
    ];
  }
}
