import {
  css,
  CSSResultArray,
  customElement,
  html,
  TemplateResult,
} from "lit-element";

import { markdown } from "../../legacy/markdown/markdown";
import { localize } from "../../localize/localize";
import { version } from "../../version";
import { HacsDialogBase } from "./hacs-dialog-base";
import "./hacs-dialog";

@customElement("hacs-about-dialog")
export class HacsAboutDialog extends HacsDialogBase {
  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
      >
        <div slot="header">
          ${this.narrow ? "HACS" : "Home Asisstant Community Store"}
        </div>
        <div class="content">
          ${markdown.html(`
**${localize("dialog_about.integration_version")}:** | ${
            this.configuration.version
          }
--|--
**${localize("dialog_about.frontend_version")}:** | ${version}
**${localize("common.repositories")}:** | ${this.repositories.length}
**${localize("dialog_about.installed_repositories")}:** | ${
            this.repositories.filter((repo) => repo.installed).length
          }

**${localize("dialog_about.useful_links")}:**

- [General documentation](https://hacs.xyz/)
- [Configuration](https://hacs.xyz/docs/configuration/start)
- [FAQ](https://hacs.xyz/docs/faq/what)
- [GitHub](https://github.com/hacs)
- [Discord](https://discord.gg/apgchf8)
- [Become a GitHub sponsor? ❤️](https://github.com/sponsors/ludeeus)
- [BuyMe~~Coffee~~Beer? 🍺🙈](https://buymeacoffee.com/ludeeus)

***

_Everything you find in HACS is **not** tested by Home Assistant, that includes HACS itself._
_The HACS and Home Assistant teams do not support **anything** you find here._
        `)}
        </div>
      </hacs-dialog>
    `;
  }

  static get styles(): CSSResultArray {
    return [
      css`
        .content {
          font-size: 16px;
          padding-top: 16px;
        }
      `,
    ];
  }
}
