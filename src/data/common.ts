import { PageNavigation } from "../../homeassistant-frontend/src/layouts/hass-tabs-subpage";
import { RepositoryBase, RepositoryInfo } from "./repository";

export interface HacsPageNavigation extends PageNavigation {
  class?: string;
  categories?: string[];
  secondary?: string;
  dialog?: string;
  integration?: string;
  repository?: RepositoryBase;
}
export interface Route {
  path: string;
  prefix: string;
}

export interface Critical {
  repository: string;
  reason: string;
  link: string;
  acknowledged: boolean;
}

export interface LovelaceResource {
  type: "css" | "js" | "module" | "html";
  url: string;
  id: number;
}

export interface LovelaceResourcesMutableParams {
  resource_id?: number;
  res_type: "css" | "js" | "module" | "html";
  url: string;
}

export interface Message {
  name: string;
  info: string;
  secondary?: string;
  severity?: "info" | "warning" | "error" | "success";
  path?: string;
  iconPath?: string;
  dialog?: string;
  repository?: RepositoryBase;
}

export interface LocationChangedEvent {
  detail?: { route: Route; force?: boolean };
}

export interface HacsDialogEvent {
  detail?: {
    type: string;
    header?: string;
    content?: string;
    markdown?: boolean;
    frosen?: boolean;
    repository?: RepositoryBase;
  };
}

export interface RemovedRepository {
  link?: string;
  reason?: string;
  removal_type: string;
  repository: string;
}

export interface Filter {
  id: string;
  value: string;
  checked?: boolean;
}

export const sortRepositoriesByName = (
  repositories: RepositoryBase[] | RepositoryInfo[]
): RepositoryBase[] | RepositoryInfo[] =>
  repositories?.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));

export enum HacsDispatchEvent {
  CONFIG = "hacs_dispatch_config",
  ERROR = "hacs_dispatch_error",
  RELOAD = "hacs_dispatch_reload",
  REPOSITORY = "hacs_dispatch_repository",
  STAGE = "hacs_dispatch_stage",
  STARTUP = "hacs_dispatch_startup",
  STATUS = "hacs_dispatch_status",
}
