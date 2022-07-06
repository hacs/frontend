import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { HacsInfo } from "./hacs";
import {
  Critical,
  LovelaceResource,
  LovelaceResourcesMutableParams,
  RemovedRepository,
  HacsDispatchEvent,
} from "./common";
import { RepositoryBase } from "./repository";

export const fetchHacsInfo = async (hass: HomeAssistant) =>
  hass.connection.sendMessagePromise<HacsInfo>({
    type: "hacs/info",
  });

export const getRepositories = async (hass: HomeAssistant) =>
  hass.connection.sendMessagePromise<RepositoryBase[]>({
    type: "hacs/repositories/list",
  });

export const getCritical = async (hass: HomeAssistant) =>
  hass.connection.sendMessagePromise<Critical[]>({
    type: "hacs/critical/list",
  });

export const getRemovedRepositories = async (hass: HomeAssistant) =>
  hass.connection.sendMessagePromise<RemovedRepository[]>({
    type: "hacs/repositories/removed",
  });

export const repositoryUninstall = async (hass: HomeAssistant, repository: string) =>
  hass.connection.sendMessagePromise<void>({
    type: "hacs/repository/remove",
    repository,
  });

export const repositoryIgnore = async (hass: HomeAssistant, repository: string) =>
  hass.connection.sendMessagePromise<void>({
    type: "hacs/repository/ignore",
    repository,
  });

export const repositoryReleasenotes = async (hass: HomeAssistant, repository: string) =>
  hass.connection.sendMessagePromise<{ name: string; body: string; tag: string }[]>({
    type: "hacs/repository/release_notes",
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

export const clearNewRepositories = async (
  hass: HomeAssistant,
  data: { categories?: string[]; repository?: string }
) =>
  hass.connection.sendMessagePromise<void>({
    type: "hacs/repositories/clear_new",
    ...data,
  });

export const getLovelaceConfiguration = async (hass: HomeAssistant) => {
  try {
    const response = await hass.connection.sendMessagePromise<LovelaceResource[]>({
      type: "lovelace/resources",
    });
    return response;
  } catch (e) {
    return null;
  }
};

export const fetchResources = (hass: HomeAssistant): Promise<LovelaceResource[]> =>
  hass.connection.sendMessagePromise({
    type: "lovelace/resources",
  });

export const createResource = (hass: HomeAssistant, values: LovelaceResourcesMutableParams) =>
  hass.callWS<LovelaceResource>({
    type: "lovelace/resources/create",
    ...values,
  });

export const updateResource = (hass: HomeAssistant, values: LovelaceResourcesMutableParams) =>
  hass.callWS<LovelaceResource>({
    type: "lovelace/resources/update",
    ...values,
  });

export const deleteResource = (hass: HomeAssistant, id: string) =>
  hass.callWS({
    type: "lovelace/resources/delete",
    resource_id: id,
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
