import { Repository } from "../data/common";
import { Hacs } from "../data/hacs";

const generateUniqueTag = (repository: Repository, version?: string): string =>
  String(
    `${repository.id}${(
      version ||
      repository.installed_version ||
      repository.selected_tag ||
      repository.available_version
    ).replace(/\D+/g, "")}`
  );

export const generateLovelaceURL = (repository: Repository, version?: string): string =>
  `/hacsfiles/${repository.full_name.split("/")[1]}/${
    repository.file_name
  }?hacstag=${generateUniqueTag(repository, version)}`;

export const addedToLovelace = (hacs: Hacs, repository: Repository): boolean => {
  if (!repository.installed) {
    return true;
  }
  if (repository.category !== "plugin") {
    return true;
  }
  if (hacs.status?.lovelace_mode !== "storage") {
    return true;
  }
  const expectedUrl = generateLovelaceURL(repository);
  return hacs.resources?.some((resource) => expectedUrl.includes(resource.url)) || false;
};
