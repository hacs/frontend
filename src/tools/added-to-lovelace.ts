import { Repository } from "../data/common";
import { Hacs } from "../data/hacs";

export const lovelaceURL = (repository: Repository) => {
  return `/hacsfiles/${repository?.full_name.split("/")[1]}/${repository?.file_name}`;
};

export const addedToLovelace = (hacs: Hacs, repository: Repository) => {
  if (hacs.status?.lovelace_mode !== "storage") {
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
