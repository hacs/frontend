import {
  LitElement,
  customElement,
  CSSResultArray,
  css,
  TemplateResult,
  html,
  property
} from "lit-element";
import { Configuration, Repository } from "../types";
import { HacsStyle } from "../style/hacs-style";
import { HomeAssistant } from "custom-card-helpers";
import { localize } from "../localize/localize";

interface LoveLaceHint extends HTMLElement {
  hass?: HomeAssistant;
  configuration?: Configuration;
  repository?: Repository;
}

@customElement("hacs-repository-note")
export class RepositoryNote extends LitElement {
  @property({ type: Object }) public configuration!: Configuration;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public repository!: Repository;

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
