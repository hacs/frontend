import { html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import memoizeOne from "memoize-one";
import { Repository } from "../../data/common";
import { markdown } from "../../tools/markdown/markdown";
import "./hacs-dialog";
import "../hacs-link";
import { HacsDialogBase } from "./hacs-dialog-base";

@customElement("hacs-generic-dialog")
export class HacsGenericDialog extends HacsDialogBase {
  @property({ type: Boolean }) public markdown = false;

  @property() public repository?: string;

  @property() public header?: string;

  @property() public content?: string;

  private _getRepository = memoizeOne((repositories: Repository[], repository: string) =>
    repositories?.find((repo) => repo.id === repository)
  );

  protected render(): TemplateResult | void {
    if (!this.active || !this.repository) return html``;
    const repository = this._getRepository(this.hacs.repositories, this.repository);
    return html`
      <hacs-dialog .active=${this.active} .narrow=${this.narrow} .hass=${this.hass}>
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
