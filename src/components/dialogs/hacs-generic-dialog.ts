import { html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import memoizeOne from "memoize-one";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";
import { RepositoryBase } from "../../data/repository";
import { markdownWithRepositoryContext } from "../../tools/markdown";

@customElement("hacs-generic-dialog")
export class HacsGenericDialog extends HacsDialogBase {
  @property({ type: Boolean }) public markdown = false;

  @property() public repository?: string;

  @property() public header?: string;

  @property() public content?: string;

  private _getRepository = memoizeOne((repositories: RepositoryBase[], repository: string) =>
    repositories?.find((repo) => String(repo.id) === repository)
  );

  protected render(): TemplateResult | void {
    if (!this.active || !this.repository) return html``;
    const repository = this._getRepository(this.hacs.repositories, this.repository);
    return html`
      <hacs-dialog .active=${this.active} .narrow=${this.narrow} .hass=${this.hass}>
        <div slot="header">${this.header || ""}</div>
        ${this.markdown
          ? html`<ha-markdown
              .content=${markdownWithRepositoryContext(
                this.content || "",
                // @ts-ignore
                repository
              )}
            ></ha-markdown>`
          : this.content || ""}
      </hacs-dialog>
    `;
  }
}
