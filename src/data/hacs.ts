import { Repository, Configuration, Status } from "./common";

export interface Hacs {
  language: string;
  messages: { class: string; iconPath: string; info: string; name: string; path: string }[];
  updates: any[];
  resources: any[];
  repositories: Repository[];
  removed: any[];
  configuration: Configuration;
  sections: any;
  status: Status;
  localize(string: string, replace?: Record<string, any>): string;
  addedToLovelace?(hacs: Hacs, repository: Repository): boolean;
  log: any;
}
