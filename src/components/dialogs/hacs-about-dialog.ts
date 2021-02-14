import { customElement, html, TemplateResult } from "lit-element";

import { markdown } from "../../tools/markdown/markdown";
import { version } from "../../version";
import { HacsDialogBase } from "./hacs-dialog-base";
import "./hacs-dialog";
import "../hacs-link";

@customElement("hacs-about-dialog")
export class HacsAboutDialog extends HacsDialogBase {
  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    return html`
      <hacs-dialog
        .active=${this.active}
        .hass=${this.hass}
        .title=${this.narrow ? "HACS" : "Home Assistant Community Store"}
        hideActions
      >
        <div class="content">
          ${markdown.html(`
**${this.hacs.localize("dialog_about.integration_version")}:** | ${this.hacs.configuration.version}
--|--
**${this.hacs.localize("dialog_about.frontend_version")}:** | ${version}
**${this.hacs.localize("common.repositories")}:** | ${this.repositories.length}
**${this.hacs.localize(
            "dialog_about.installed_repositories"
          )}:** | ${this.repositories.filter((repo) => repo.installed).length}

**${this.hacs.localize("dialog_about.useful_links")}:**

- [General documentation](https://hacs.xyz/)
- [Configuration](https://hacs.xyz/docs/configuration/start)
- [FAQ](https://hacs.xyz/docs/faq/what)
- [GitHub](https://github.com/hacs)
- [Discord](https://discord.gg/apgchf8)
- [Become a GitHub sponsor? ❤️](https://github.com/sponsors/ludeeus)
- [BuyMe~~Coffee~~Beer? 🍺🙈](https://buymeacoffee.com/ludeeus)

***

_Everything you find in HACS is **not** tested by Home Assistant, that includes HACS itself.
The HACS and Home Assistant teams do not support **anything** you find here._
        `)}
        </div>
      </hacs-dialog>
    `;
  }
}
