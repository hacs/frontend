import type { LocalizeFunc } from "../../homeassistant-frontend/src/common/translations/localize";
import type { HacsLocalizeKeys } from "../data/localize";
import type { RepositoryBase, RepositoryCategory } from "./repository";

export interface HacsInfo {
  categories: RepositoryCategory[];
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
  log: any;
}
