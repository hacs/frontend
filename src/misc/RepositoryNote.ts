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

import "./LoveLaceHint";

@customElement("hacs-repository-note")
export class RepositoryNote extends LitElement {
  @property({ type: Object }) public configuration!: Configuration;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public repository!: Repository;

  protected render(): TemplateResult | void {
    return html`
      <div class="repository-note">
        <p>
          ${localize(`repository.note_installed`)}
          '${this.repository.local_path}'
          ${this.repository.category === "appdaemon"
            ? html`
                , ${localize(`repository.note_${this.repository.category}`)}
              `
            : ""}
          ${this.repository.category === "integration"
            ? html`
                , ${localize(`repository.note_${this.repository.category}`)}
              `
            : ""}
          ${this.repository.category === "plugin"
            ? html`
                , ${localize(`repository.note_${this.repository.category}`)}
              `
            : ""}
          .
        </p>

        ${this.repository.category === "plugin"
          ? html`
              <hacs-lovelace-hint
                .hass=${this.hass}
                .configuration=${this.configuration}
                .repository=${this.repository}
              ></hacs-lovelace-hint>
            `
          : ""}
      </div>
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
