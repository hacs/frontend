import {
  LitElement,
  customElement,
  CSSResultArray,
  css,
  TemplateResult,
  html,
  property,
} from "lit-element";
import {
  Configuration,
  RepositoryData,
  Status,
  LovelaceConfig,
  LovelaceResourceConfig,
} from "../data";
import { HacsStyle } from "../style/hacs-style";
import { HomeAssistant } from "custom-card-helpers";
import { localize } from "../localize/localize";

import { AddedToLovelace } from "./AddedToLovelace";

interface LoveLaceHint extends HTMLElement {
  hass?: HomeAssistant;
  configuration?: Configuration;
  repository?: RepositoryData;
}

@customElement("hacs-repository-note")
export class RepositoryNote extends LitElement {
  @property({ attribute: false }) public configuration!: Configuration;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public repository!: RepositoryData;
  @property({ attribute: false }) public lovelaceconfig:
    | LovelaceConfig
    | LovelaceResourceConfig[];
  @property({ attribute: false }) public status!: Status;

  protected render(): TemplateResult | void {
    const addedToLovelace = AddedToLovelace(
      this.repository,
      this.lovelaceconfig,
      this.status
    );
    let path: string = this.repository.local_path;
    if (this.repository.category === "theme") {
      path = `${path}/${this.repository.file_name}`;
    }

    const Note = document.createElement("div");
    Note.className = "repository-note";

    const p = document.createElement("p");
    p.innerText = `${localize(`repository.note_installed`)} '${path}'`;
    if (["appdaemon", "integration"].includes(this.repository.category)) {
      p.innerText += `, ${localize(
        `repository.note_${this.repository.category}`
      )}.`;
    } else if (this.repository.category === "plugin" && !addedToLovelace) {
      p.innerHTML += `, ${localize("repository.note_plugin_post_107").replace(
        "/config/lovelace/resources",
        "<hacs-link url='/config/lovelace/resources'>'/config/lovelace/resources'</hacs-link>"
      )}`;
    }

    Note.appendChild(p);

    if (this.repository.category === "plugin" && !addedToLovelace) {
      const LLHint: LoveLaceHint = document.createElement("hacs-lovelace-hint");
      LLHint.hass = this.hass;
      LLHint.configuration = this.configuration;
      LLHint.repository = this.repository;
      Note.appendChild(LLHint);
    }

    return html` ${Note} `;
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
      `,
    ];
  }
}
