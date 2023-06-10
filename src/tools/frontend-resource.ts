import {
  createResource,
  fetchResources,
  updateResource,
} from "../../homeassistant-frontend/src/data/lovelace";
import type { HomeAssistant } from "../../homeassistant-frontend/src/types";
import type { RepositoryInfo } from "../data/repository";
import { HacsLogger } from "./hacs-logger";

const generateUniqueTag = (repository: RepositoryInfo, version?: string): string =>
  String(
    `${repository.id}${(
      version ||
      repository.installed_version ||
      repository.selected_tag ||
      repository.available_version
    ).replace(/\D+/g, "")}`
  );

export async function updateFrontendResource(
  hass: HomeAssistant,
  repository: RepositoryInfo,
  version?: string
): Promise<void> {
  const logger = new HacsLogger("updateLovelaceResources");
  const resources = await fetchResources(hass.connection);
  const namespace = `/hacsfiles/${repository.full_name.split("/")[1]}`;
  const url = generateFrontendResourceURL({ repository, version });
  const exsisting = resources.find((resource) => resource.url.includes(namespace));

  logger.debug({ namespace, url, exsisting });

  if (exsisting && exsisting.url !== url) {
    logger.debug(`Updating exsusting resource for ${namespace}`);
    await updateResource(hass, exsisting.id, {
      url,
      res_type: exsisting.type,
    });
  } else if (!resources.map((resource) => resource.url).includes(url)) {
    logger.debug(`Adding ${url} to Lovelace resources`);
    await createResource(hass, {
      url,
      res_type: "module",
    });
  }
}

export const generateFrontendResourceURL = (options: {
  repository: RepositoryInfo;
  version?: string;
  skipTag?: boolean;
}): string =>
  `/hacsfiles/${options.repository.full_name.split("/")[1]}/${options.repository.file_name}${
    !options.skipTag ? `?hacstag=${generateUniqueTag(options.repository, options.version)}` : ""
  }`;
