import { customElement, TemplateResult, html } from "lit-element";
import { HacsRepositoryButton } from "./HacsRepositoryButton";
import { localize } from "../../../localize/localize";

@customElement("hacs-button-open-plugin")
export class HacsButtonOpenPlugin extends HacsRepositoryButton {
  protected render(): TemplateResult | void {
    if (this.repository.category != "plugin") return html``;
    if (!this.repository.installed) return html``;

    const path = this.repository.local_path.split("/");

    return html`
      <a
        href="/hacsfiles/${path.pop()}/${this.repository.file_name}"
        target="_blank"
      >
        <mwc-button>
          ${localize(`repository.open_plugin`)}
        </mwc-button>
      </a>
    `;
  }
}
