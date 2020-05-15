import { customElement, html, TemplateResult, property } from "lit-element";
import { selectRepository } from "../../data/common";
import { HacsDialogBase } from "./hacs-dialog-base";
import { markdown } from "../../legacy/markdown/markdown";

@customElement("hacs-generic-dialog")
export class HacsGenericDialog extends HacsDialogBase {
  @property({ type: Boolean }) public markdown: boolean = false;
  @property() public repository?: string;
  @property() public header?: string;
  @property() public content?: string;

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const repository = selectRepository(this.repositories, this.repository);
    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
      >
        <div slot="header">${this.header || ""}</div>
        ${this.markdown
          ? this.repository
            ? markdown.html(this.content || "", repository)
            : markdown.html(this.content || "")
          : this.content || ""}
      </hacs-dialog>
    `;
  }
}
