import { RepositoryData, Configuration } from "../types";
import { HACS } from "../Hacs";
import { version as frontend_version } from "../../version.js";

export function AboutHacs(
  hacs: HACS,
  repositories: RepositoryData[],
  configuration: Configuration
): HTMLElement {
  const content = document.createElement("div");
  content.style.color = `var(--primary-text-color)`;
  content.innerHTML = hacs.markdown(`
### HACS (Home Assistant Community Store)

**Integration ${hacs.localize("common.version").toLowerCase()}:**| ${
    configuration.version
  }
-- | --
**Frontend ${hacs
    .localize("common.version")
    .toLowerCase()}:** | ${frontend_version}
**${hacs.localize("common.repositories")}:** | ${repositories.length || 0}
  `);

  return content;
}
