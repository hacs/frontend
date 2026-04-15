import type { TemplateResult } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import { repeat } from "lit/directives/repeat";

import "../../homeassistant-frontend/src/components/chips/ha-chip-set";
import "../../homeassistant-frontend/src/components/ha-button-menu";
import "../../homeassistant-frontend/src/components/ha-label";
import "../../homeassistant-frontend/src/components/ha-list-item";

const MAX_VISIBLE_TOPICS = 2;

@customElement("hacs-data-table-topics")
export class HacsDataTableTopics extends LitElement {
  @property({ attribute: false }) public topics: string[] = [];

  protected render(): TemplateResult {
    if (!this.topics.length) {
      return nothing;
    }

    return html`
      <ha-chip-set>
        ${repeat(
          this.topics.slice(0, MAX_VISIBLE_TOPICS),
          (topic) => topic,
          (topic) => html`<ha-label dense>${topic}</ha-label>`,
        )}
        ${this.topics.length > MAX_VISIBLE_TOPICS
          ? html`<ha-button-menu
              absolute
              role="button"
              tabindex="0"
              @click=${this._handleOverflowMenuOpened}
              @closed=${this._handleOverflowMenuClosed}
            >
              <ha-label slot="trigger" class="plus" dense>
                +${this.topics.length - MAX_VISIBLE_TOPICS}
              </ha-label>
              ${repeat(
                this.topics.slice(MAX_VISIBLE_TOPICS),
                (topic) => topic,
                (topic) => html`
                  <ha-list-item noninteractive>
                    <ha-label dense>${topic}</ha-label>
                  </ha-list-item>
                `,
              )}
            </ha-button-menu>`
          : nothing}
      </ha-chip-set>
    `;
  }

  protected _handleOverflowMenuOpened(e) {
    e.stopPropagation();
    const row = this.closest(".mdc-data-table__row") as HTMLDivElement | null;
    if (row) {
      row.style.zIndex = "1";
    }
  }

  protected _handleOverflowMenuClosed() {
    const row = this.closest(".mdc-data-table__row") as HTMLDivElement | null;
    if (row) {
      row.style.zIndex = "";
    }
  }

  static get styles() {
    return css`
      :host {
        display: block;
        flex-grow: 1;
        margin-top: 4px;
        height: 22px;
      }

      ha-chip-set {
        position: fixed;
        flex-wrap: nowrap;
      }

      ha-button-menu {
        border-radius: 10px;
      }

      .plus {
        --ha-label-background-color: transparent;
        border: 1px solid var(--divider-color);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hacs-data-table-topics": HacsDataTableTopics;
  }
}
