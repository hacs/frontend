import { Hacs } from "../data/hacs";
import { RepositoryInfo } from "../data/repository";

const generateUniqueTag = (repository: RepositoryInfo, version?: string): string =>
  String(
    `${repository.id}${(
      version ||
      repository.installed_version ||
      repository.selected_tag ||
      repository.available_version
    ).replace(/\D+/g, "")}`
  );

export const generateLovelaceURL = (options: {
  repository: RepositoryInfo;
  version?: string;
  skipTag?: boolean;
}): string =>
  `/hacsfiles/${options.repository.full_name.split("/")[1]}/${options.repository.file_name}${
    !options.skipTag ? `?hacstag=${generateUniqueTag(options.repository, options.version)}` : ""
  }`;

export const addedToLovelace = (hacs: Hacs, repository: RepositoryInfo): boolean => {
  if (!repository.installed) {
    return true;
  }
  if (repository.category !== "plugin") {
    return true;
  }
  if (hacs.info?.lovelace_mode !== "storage") {
    return true;
  }
  const expectedUrl = generateLovelaceURL({ repository, skipTag: true });
  return hacs.resources?.some((resource) => resource.url.includes(expectedUrl)) || false;
};
