import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { Repository } from "../data/common";
import { createResource, fetchResources, updateResource } from "../data/websocket";
import { generateLovelaceURL } from "./added-to-lovelace";

import { HacsLogger } from "./hacs-logger";

export async function updateLovelaceResources(
  hass: HomeAssistant,
  repository: Repository,
  version?: string
): Promise<void> {
  const logger = new HacsLogger("updateLovelaceResources");
  const resources = await fetchResources(hass);
  const namespace = `/hacsfiles/${repository.full_name.split("/")[1]}`;
  const url = generateLovelaceURL({ repository, version });
  const exsisting = resources.find((resource) => resource.url.includes(namespace));

  logger.debug({ namespace, url, exsisting });

  if (exsisting && exsisting.url !== url) {
    logger.debug(`Updating exsusting resource for ${namespace}`);
    await updateResource(hass, {
      url,
      resource_id: exsisting.id,
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
