import {
  css,
  CSSResultArray,
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";
import { markdown } from "../../legacy/markdown/markdown";

import { Repository } from "../../data/common";

@customElement("hacs-generic-dialog")
export class HacsGenericDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Boolean }) public narrow!: boolean;
  @property({ type: Boolean }) public active: boolean = false;
  @property({ type: Boolean }) public markdown: boolean = false;
  @property({ attribute: false }) public repository?: Repository;
  @property() public header?: string;
  @property() public content?: string;

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
      >
        <div slot="header">${this.header || ""}</div>
        ${this.markdown
          ? this.repository
            ? markdown.html(this.content || "", this.repository)
            : markdown.html(this.content || "")
          : this.content || ""}
      </hacs-dialog>
    `;
  }

  static get styles(): CSSResultArray {
    return [css``];
  }
}
