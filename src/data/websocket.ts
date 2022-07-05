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

export const getCritical = async (hass: HomeAssistant) => {
  const response = await hass.connection.sendMessagePromise<Critical[]>({
    type: "hacs/critical/list",
  });
  return response;
};

export const getRemovedRepositories = async (hass: HomeAssistant) => {
  const response = await hass.connection.sendMessagePromise<RemovedRepository[]>({
    type: "hacs/repositories/removed",
  });
  return response;
};

export const repositoryInstall = async (hass: HomeAssistant, repository: string) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository",
    action: "install",
    repository: repository,
  });
};

export const repositoryUninstall = async (hass: HomeAssistant, repository: string) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository",
    action: "uninstall",
    repository: repository,
  });
};

export const repositoryIgnore = async (hass: HomeAssistant, repository: string) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository/ignore",
    repository: repository,
  });
};

export const repositoryReleasenotes = async (
  hass: HomeAssistant,
  repository: string,
  currentVersion: string
) => {
  const response = await hass.connection.sendMessagePromise<
    { name: string; body: string; tag: string }[]
  >({
    type: "hacs/repository",
    action: "release_notes",
    repository: repository,
    data: { current_version: currentVersion },
  });
  return response;
};

export const repositoryToggleBeta = async (hass: HomeAssistant, repository: string) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository",
    action: "toggle_beta",
    repository: repository,
  });
};

export const repositoryAdd = async (hass: HomeAssistant, repository: string, category: string) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository/data",
    action: "add",
    repository: repository,
    data: category,
  });
};

export const repositorySetNotNew = async (hass: HomeAssistant, repository: string) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository",
    action: "not_new",
    repository: repository,
  });
};

export const repositoryUpdate = async (hass: HomeAssistant, repository: string) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository",
    action: "update",
    repository: repository,
  });
};

export const repositoryDelete = async (hass: HomeAssistant, repository: string) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository",
    action: "delete",
    repository: repository,
  });
};

export const settingsClearAllNewRepositories = async (
  hass: HomeAssistant,
  categories: string[]
) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/settings",
    action: "clear_new",
    categories,
  });
};

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
