import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { Repository } from "../data/common";
import { createResource, fetchResources, updateResource } from "../data/websocket";

import { HacsLogger } from "./hacs-logger";

export async function updateLovelaceResources(
  hass: HomeAssistant,
  repository: Repository
): Promise<void> {
  const logger = new HacsLogger();
  const resources = await fetchResources(hass);
  const namespace = `/hacsfiles/${repository.full_name.split("/")[1]}`;
  const url = `${namespace}/${repository.file_name}`;
  const exsisting = resources.find((resource) => resource.url.includes(namespace));

  logger.debug({ namespace, url, exsisting }, "updateLovelaceResources");

  if (exsisting && exsisting.url !== url) {
    logger.debug(`Updating exsusting resource for ${namespace}`);
    updateResource(hass, {
      url,
      resource_id: exsisting.id,
      res_type: exsisting.type,
    });
  } else if (!resources.map((resource) => resource.url).includes(url)) {
    logger.debug(`Adding ${url} to Lovelace resources`);
    createResource(hass, {
      url,
      res_type: "module",
    });
  }
}
