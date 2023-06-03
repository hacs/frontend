import { html } from "lit";
import { version } from "../../version";
import { Hacs } from "../../data/hacs";
import { showAlertDialog } from "../../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import "../../../homeassistant-frontend/src/components/ha-markdown";

const markdownContent = (hacs: Hacs) => `
**${hacs.localize("dialog_about.integration_version")}:** | ${hacs.info.version}
:--|--
**${hacs.localize("dialog_about.frontend_version")}:** | ${version}
**${hacs.localize("common.repositories")}:** | ${hacs.repositories.length}
**${hacs.localize("dialog_about.downloaded_repositories")}:** | ${
  hacs.repositories.filter((repo) => repo.installed).length
}

**${hacs.localize("dialog_about.useful_links")}:**

- [General documentation](https://hacs.xyz/)
- [Configuration](https://hacs.xyz/docs/configuration/start)
- [FAQ](https://hacs.xyz/docs/faq/what)
- [GitHub](https://github.com/hacs)
- [Discord](https://discord.gg/apgchf8)
- [Become a GitHub sponsor? ❤️](https://github.com/sponsors/ludeeus)
- [BuyMe~~Coffee~~Beer? 🍺🙈](https://buymeacoffee.com/ludeeus)

***

_Everything you find in HACS is **not** tested by Home Assistant, that includes HACS itself.
The HACS and Home Assistant teams do not support **anything** you find here._`;

export const showDialogAbout = async (element: any, hacs: Hacs) =>
  showAlertDialog(element, {
    title: "Home Assistant Community Store",
    confirmText: hacs.localize("common.close"),
    text: html`<ha-markdown .content=${markdownContent(hacs)}></ha-markdown>`,
  });
