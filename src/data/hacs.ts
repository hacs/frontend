import { Repository, Configuration, Status } from "./common";

export interface Hacs {
  messages?: { class: string; iconPath: string; info: string; name: string; path: string }[];
  updates?: any[];
  resources?: any[];
  removed?: any[];
  configuration?: Configuration;
  sections?: any;
  status?: Status;
  localize?(string: string, search?: string, replace?: string): string;
  addedToLovelace?(hacs: Hacs, repository: Repository): boolean;
  log?: any;
}
