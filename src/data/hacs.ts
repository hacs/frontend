import { Message } from "./common";
import { RepositoryBase } from "./repository";

export interface HacsInfo {
  categories: string[];
  country: string;
  debug: boolean;
  dev: boolean;
  disabled_reason: string;
  experimental: boolean;
  lovelace_mode: "storage" | "yaml" | "auto-gen";
  stage: "startup" | "waiting" | "running" | "setup";
  startup: boolean;
  version: string;
}

export interface Hacs {
  language: string;
  messages: Message[];
  updates: any[];
  resources: any[];
  repositories: RepositoryBase[];
  removed: any[];
  sections: any;
  info: HacsInfo;
  localize(string: string, replace?: Record<string, any>): string;
  addedToLovelace?(hacs: Hacs, repository: RepositoryBase): boolean;
  log: any;
}
