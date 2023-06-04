import type { RepositoryInfo } from "../data/repository";

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
