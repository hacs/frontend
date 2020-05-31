import { Configuration, LovelaceResource, Repository } from "../data/common";

export const addedToLovelace = (
  resources: LovelaceResource[],
  configuration: Configuration,
  repository: Repository
) => {
  if (configuration.frontend_mode === "yaml") {
    return true;
  }
  if (!repository.installed) {
    return true;
  }
  if (repository.category !== "plugin") {
    return true;
  }
  const url = `/hacsfiles/${repository?.full_name.split("/")[1]}/${
    repository?.file_name
  }`;
  return resources.map((resource) => resource.url).includes(url);
};
