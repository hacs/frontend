import { HomeAssistant } from "../../homeassistant-frontend/src/types";

export type RepositoryCategory =
  | "integration"
  | "plugin"
  | "python_script"
  | "theme"
  | "appdaemon"
  | "netdaemon";

export interface RepositoryBase {
  authors: string[];
  category: RepositoryCategory;
  country: string[];
  custom: boolean;
  description: string;
  domain: string | null;
  downloads: number;
  file_name: string;
  full_name: string;
  hide: boolean;
  homeassistant: string | null;
  id: number;
  installed: boolean;
  last_updated: string;
  local_path: string;
  name: string;
  new: boolean;
  pending_upgrade: boolean;
  stars: number;
  state: string;
  status_description: string;
  status: string;
  topics: string[];
}

export interface RepositoryInfo extends RepositoryBase {
  additional_info: string;
  available_version: string;
  beta: boolean;
  can_install: boolean;
  config_flow: boolean;
  default_branch: string;
  hide_default_branch: boolean;
  installed_version: string;
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
