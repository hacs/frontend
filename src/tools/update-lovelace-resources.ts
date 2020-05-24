import { HomeAssistant } from "custom-card-helpers";

import { Repository } from "../data/common";
import {
  createResource,
  fetchResources,
  updateResource,
} from "../data/websocket";

export async function updateLovelaceResources(
  hass: HomeAssistant,
  repository: Repository
): Promise<void> {
  const resources = await fetchResources(hass);
  const namespace = repository.full_name.split("/")[1];
  const exsisting = resources.find((resource) =>
    resource.url.includes(namespace)
  );

  const url = `/hacsfiles/${namespace}/${repository.file_name}`;
  if (exsisting && exsisting.url !== url) {
    console.debug(`Updating exsusting resource for ${namespace}`);
    updateResource(hass, {
      url,
      resource_id: exsisting.id,
      res_type: exsisting.type,
    });
  } else if (!resources.map((resource) => resource.url).includes(url)) {
    console.debug(`Adding ${url} to Lovelace resources`);
    createResource(hass, {
      url,
      res_type: "module",
    });
  }
}
