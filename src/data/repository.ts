import { HomeAssistant } from "../../homeassistant-frontend/src/types";

export type RepositoryCategory =
  | "appdaemon"
  | "integration"
  | "netdaemon"
  | "plugin"
  | "python_script"
  | "theme";

export interface RepositoryBase {
  authors: string[];
  available_version: string;
  can_download: boolean;
  category: RepositoryCategory;
  config_flow: boolean;
  country: string[];
  custom: boolean;
  description: string;
  domain: string | null;
  downloads: number;
  file_name: string;
  full_name: string;
  hide: boolean;
  homeassistant: string | null;
  id: string;
  installed_version: string;
  installed: boolean;
  last_updated: string;
  local_path: string;
  name: string;
  new: boolean;
  pending_upgrade: boolean;
  stars: number;
  state: string;
  status: string;
  topics: string[];
}

export interface RepositoryInfo extends RepositoryBase {
  additional_info: string;
  beta: boolean;
  default_branch: string;
  hide_default_branch: boolean;
  issues: number;
  releases: string[];
  ref: string;
  selected_tag: string | null;
  version_or_commit: "version" | "commit";
}

export const fetchRepositoryInformation = async (
  hass: HomeAssistant,
  repositoryId: string
): Promise<RepositoryInfo | undefined> =>
  hass.connection.sendMessagePromise({
    type: "hacs/repository/info",
    repository_id: repositoryId,
  });

export const repositoryDownloadVersion = async (
  hass: HomeAssistant,
  repository: string,
  version?: string
) =>
  hass.connection.sendMessagePromise<void>({
    type: "hacs/repository/download",
    repository: repository,
    version,
  });

export const repositorySetVersion = async (
  hass: HomeAssistant,
  repository: string,
  version: string
) =>
  hass.connection.sendMessagePromise<void>({
    type: "hacs/repository/version",
    repository: repository,
    version,
  });
