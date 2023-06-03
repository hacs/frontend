import { LocalizeFunc } from "../../homeassistant-frontend/src/common/translations/localize";
import { HacsLocalizeKeys } from "../data/localize";
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
  repositories: RepositoryBase[];
  info: HacsInfo;
  localize: LocalizeFunc<HacsLocalizeKeys>;
  addedToLovelace?(hacs: Hacs, repository: RepositoryBase): boolean;
  log: any;
}
