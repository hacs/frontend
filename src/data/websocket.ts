import type { HomeAssistant } from "../../homeassistant-frontend/src/types";
import type { Hacs, HacsInfo } from "./hacs";
import type { HacsDispatchEvent } from "./common";
import type { RepositoryBase } from "./repository";

export const fetchHacsInfo = async (hass: HomeAssistant) =>
  hass.connection.sendMessagePromise<HacsInfo>({
    type: "hacs/info",
  });

export const getRepositories = async (hass: HomeAssistant) =>
  hass.connection.sendMessagePromise<RepositoryBase[]>({
    type: "hacs/repositories/list",
  });

export const repositoryUninstall = async (hass: HomeAssistant, repository: string) =>
  hass.connection.sendMessagePromise<void>({
    type: "hacs/repository/remove",
    repository,
  });

export const repositoryAdd = async (hass: HomeAssistant, repository: string, category: string) =>
  hass.connection.sendMessagePromise<void>({
    type: "hacs/repositories/add",
    repository: repository,
    category,
  });

export const repositoryBeta = async (hass: HomeAssistant, repository: string, beta: boolean) =>
  hass.connection.sendMessagePromise<void>({
    type: "hacs/repository/beta",
    repository,
    show_beta: beta,
  });

export const repositoryUpdate = async (hass: HomeAssistant, repository: string) =>
  hass.connection.sendMessagePromise<void>({
    type: "hacs/repository/refresh",
    repository,
  });

export const repositoryDelete = async (hass: HomeAssistant, repository: string) =>
  hass.connection.sendMessagePromise<void>({
    type: "hacs/repositories/remove",
    repository,
  });

export const repositoriesClearNew = async (hass: HomeAssistant, hacs: Hacs) =>
  hass.connection.sendMessagePromise<void>({
    type: "hacs/repositories/clear_new",
    categories: hacs.info.categories,
  });

export const websocketSubscription = (
  hass: HomeAssistant,
  onChange: (result: Record<any, any> | null) => void,
  event: HacsDispatchEvent
) =>
  hass.connection.subscribeMessage(onChange, {
    type: "hacs/subscribe",
    signal: event,
  });
