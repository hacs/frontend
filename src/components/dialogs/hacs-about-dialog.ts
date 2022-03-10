import { markdown } from "../../tools/markdown/markdown";
import { version } from "../../version";

import { Hacs } from "../../data/hacs";
import { showAlertDialog } from "../../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";

export const showDialogAbout = async (element: any, hacs: Hacs) =>
  showAlertDialog(element, {
    title: "Home Assistant Community Store",
    confirmText: hacs.localize("common.close"),
    text: markdown.html(`
  **${hacs.localize("dialog_about.integration_version")}:** | ${hacs.configuration.version}
  --|--
  **${hacs.localize("dialog_about.frontend_version")}:** | ${version}
  **${hacs.localize("common.repositories")}:** | ${hacs.repositories.length}
  **${hacs.localize("dialog_about.downloaded_repositories")}:** | ${
      hacs.repositories.filter((repo) => repo.installed).length
    }

  **${hacs.localize("dialog_about.useful_links")}:**

  - [${hacs.localize("dialog_about.links.general_documentation")}](https://hacs.xyz/)
  - [${hacs.localize("dialog_about.links.configuration")}](https://hacs.xyz/docs/configuration/start)
  - [${hacs.localize("dialog_about.links.faq")}](https://hacs.xyz/docs/faq/what)
  - [GitHub](https://github.com/hacs)
  - [Discord](https://discord.gg/apgchf8)
  - [${hacs.localize("dialog_about.links.become_sponsor")} ❤️](https://github.com/sponsors/ludeeus)
  - [BuyMe~~Coffee~~Beer? 🍺🙈](https://buymeacoffee.com/ludeeus)

  ***

  _${hacs.localize("dialog_about.disclaimer1")}
  ${hacs.localize("dialog_about.disclaimer2")}_`),
  });
