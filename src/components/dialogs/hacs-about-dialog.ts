import {
  css,
  CSSResultArray,
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";

import { Repository, Configuration } from "../../data/common";
import { HomeAssistant } from "custom-card-helpers";

import { markdown } from "../../legacy/markdown/markdown";

import { version } from "../../version";

import "./hacs-dialog";

@customElement("hacs-about-dialog")
export class HacsAboutDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public repositories: Repository[];
  @property({ attribute: false }) public loading: boolean = true;
  @property({ attribute: false }) public active: boolean = false;

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    return html`
      <hacs-dialog
        .active=${this.active}
        .narrow=${this.narrow}
        .hass=${this.hass}
      >
        <div slot="header">Home Asisstant Community Store</div>
        <div class="content">
          ${markdown.html(`
**Integration version:** | ${this.configuration.version}
--|--
**Frontend version:** | ${version}
**Repositories:** | ${this.repositories.length}

***

_Everything you find in HACS is **not** tested by Home Assistant, that includes HACS itself._
_The HACS and Home Assistant teams do not support **anything** you find here._

***

**Useful links:**

- [General documentation](https://hacs.xyz/)
- [Configuration](https://hacs.xyz/docs/configuration/start)
- [FAQ](https://hacs.xyz/docs/faq/what)
- [GitHub](https://github.com/hacs)
- [Discord](https://discord.gg/apgchf8)
- [Become a GitHub sponsor? ❤️](https://github.com/sponsors/ludeeus)
- [BuyMe~~Coffee~~Beer? 🍺🙈](https://buymeacoffee.com/ludeeus)
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
