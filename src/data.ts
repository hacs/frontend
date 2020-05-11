import { HomeAssistant } from "custom-card-helpers";
import { HACS } from "./Hacs";

export interface Route {
  path: string;
  prefix: string;
}

export interface Status {
  background_task: boolean;
  disabled: boolean;
  lovelace_mode: "storage" | "yaml";
  reloading_data: boolean;
  startup: boolean;
  manage_mode: boolean;
  upgrading_all: boolean;
}

export interface Configuration {
  categories: [string];
  country: string;
  dev: string;
  debug: boolean;
  experimental: boolean;
  frontend_compact: boolean;
  frontend_mode: string;
  onboarding_done: boolean;
  version: string;
}

export interface Critical {
  repository: string;
  reason: string;
  link: string;
  acknowledged: boolean;
}

export interface SelectedValue {
  detail: { selected: string };
}

export interface RepositoryData {
  additional_info: string;
  authors: [string];
  available_version: string;
  beta: boolean;
  can_install: boolean;
  category: string;
  config_flow: boolean;
  country: string;
  custom: boolean;
  default_branch: string;
  description: string;
  domain: string;
  downloads: number;
  file_name: string;
  first_install: boolean;
  full_name: string;
  hide: boolean;
  hide_default_branch: boolean;
  homeassistant: string;
  id: string;
  info: string;
  installed_version: string;
  installed: boolean;
  javascript_type: string;
  last_updated: string;
  local_path: string;
  main_action: string;
  name: string;
  new: string;
  pending_upgrade: boolean;
  releases: [string];
  selected_tag: string;
  stars: number;
  state: string;
  status_description: string;
  status: string;
  topics: [string];
  updated_info: boolean;
  version_or_commit: string;
}

export interface ValueChangedEvent {
  detail?: { value: string };
}

export interface LocationChangedEvent {
  detail?: { value: Route; force?: boolean };
}

export interface RepositoryCategories {
  appdaemon_apps: RepositoryData[];
  netdaemon_apps: RepositoryData[];
  integrations: RepositoryData[];
  plugins: RepositoryData[];
  python_scripts: RepositoryData[];
  themes: RepositoryData[];
}

export const AllCategories = [
  "integrations",
  "plugins",
  "appdaemon_apps",
  "netdaemon_apps",
  "python_scripts",
  "themes",
];

export interface LovelaceConfig {
  background?: string;
  resources?: LovelaceResourceConfig[];
  title?: string;
  views: LovelaceViewConfig[];
}

export interface LovelaceViewConfig {
  background?: string;
  badges?: Array<string | LovelaceBadgeConfig>;
  cards?: LovelaceCardConfig[];
  icon?: string;
  index?: number;
  panel?: boolean;
  path?: string;
  theme?: string;
  title?: string;
  visible?: boolean | ShowViewConfig[];
}

export interface ShowViewConfig {
  user?: string;
}

export interface LovelaceBadgeConfig {
  type?: string;
  [key: string]: any;
}

export interface LovelaceCardConfig {
  index?: number;
  view_index?: number;
  type: string;
  [key: string]: any;
}

export interface LovelaceResourceConfig {
  type: "css" | "js" | "module" | "html";
  url: string;
  id?: string;
}

export interface HacsBanner extends HTMLElement {
  hacs?: HACS;
  hass?: HomeAssistant;
  repository?: RepositoryData;
  configuration?: Configuration;
  route?: Route;
  lovelaceconfig?: LovelaceConfig;
  status?: Status;
}

export interface RepositoryActionData {
  repo: string;
  action: string;
  data?: string;
}

export const getConfiguration = async (hass: HomeAssistant) => {
  const response = await hass.connection.sendMessagePromise<Configuration>({
    type: "hacs/config",
  });
  return response;
};

export const getRepositories = async (hass: HomeAssistant) => {
  const response = await hass.connection.sendMessagePromise<RepositoryData[]>({
    type: "hacs/repositories",
  });
  return response;
};

export const getCritical = async (hass: HomeAssistant) => {
  const response = await hass.connection.sendMessagePromise<Critical[]>({
    type: "hacs/get_critical",
  });
  return response;
};

export const getStatus = async (hass: HomeAssistant) => {
  const response = await hass.connection.sendMessagePromise<Status>({
    type: "hacs/status",
  });
  return response;
};

export const getLovelaceConfiguration = async (hass: HomeAssistant) => {
  try {
    const response = await hass.connection.sendMessagePromise<
      LovelaceResourceConfig[]
    >({
      type: "lovelace/resources",
    });
    return response;
  } catch (e) {
    return null;
  }
};
