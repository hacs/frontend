import { Repository } from "../data/common";
import { Hacs } from "../data/hacs";

export const addedToLovelace = (hacs: Hacs, repository: Repository) => {
  if (hacs.configuration?.frontend_mode === "yaml") {
    return true;
  }
  if (!repository.installed) {
    return true;
  }
  if (repository.category !== "plugin") {
    return true;
  }
  const url = `/hacsfiles/${repository?.full_name.split("/")[1]}/${repository?.file_name}`;
  return hacs.resources?.map((resource) => resource.url).includes(url);
};
