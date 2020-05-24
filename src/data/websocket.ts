import { HomeAssistant } from "custom-card-helpers";
import {
  Configuration,
  Repository,
  Critical,
  Status,
  LovelaceResource,
  LovelaceResourcesMutableParams,
} from "./common";

export const getConfiguration = async (hass: HomeAssistant) => {
  const response = await hass.connection.sendMessagePromise<Configuration>({
    type: "hacs/config",
  });
  return response;
};

export const getRepositories = async (hass: HomeAssistant) => {
  const response = await hass.connection.sendMessagePromise<Repository[]>({
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

export const repositoryInstall = async (
  hass: HomeAssistant,
  repository: string
) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository",
    action: "install",
    repository: repository,
  });
};

export const repositoryUninstall = async (
  hass: HomeAssistant,
  repository: string
) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository",
    action: "uninstall",
    repository: repository,
  });
};

export const repositoryToggleBeta = async (
  hass: HomeAssistant,
  repository: string
) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository",
    action: "toggle_beta",
    repository: repository,
  });
};

export const repositoryInstallVersion = async (
  hass: HomeAssistant,
  repository: string,
  version: string
) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository/data",
    action: "install",
    repository: repository,
    data: version,
  });
};

export const repositorySetVersion = async (
  hass: HomeAssistant,
  repository: string,
  version: string
) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository/data",
    action: "set_version",
    repository: repository,
    data: version,
  });
};

export const repositoryAdd = async (
  hass: HomeAssistant,
  repository: string,
  category: string
) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository/data",
    action: "add",
    repository: repository,
    data: category,
  });
};

export const repositorySetNotNew = async (
  hass: HomeAssistant,
  repository: string
) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository",
    action: "not_new",
    repository: repository,
  });
};

export const repositoryUpdate = async (
  hass: HomeAssistant,
  repository: string
) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository",
    action: "update",
    repository: repository,
  });
};

export const repositoryDelete = async (
  hass: HomeAssistant,
  repository: string
) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/repository",
    action: "delete",
    repository: repository,
  });
};

export const settingsClearAllNewRepositories = async (hass: HomeAssistant) => {
  await hass.connection.sendMessagePromise<void>({
    type: "hacs/settings",
    action: "clear_new",
  });
};

export const getLovelaceConfiguration = async (hass: HomeAssistant) => {
  try {
    const response = await hass.connection.sendMessagePromise<
      LovelaceResource[]
    >({
      type: "lovelace/resources",
    });
    return response;
  } catch (e) {
    return null;
  }
};

export const fetchResources = (
  hass: HomeAssistant
): Promise<LovelaceResource[]> =>
  hass.connection.sendMessagePromise({
    type: "lovelace/resources",
  });

export const createResource = (
  hass: HomeAssistant,
  values: LovelaceResourcesMutableParams
) =>
  hass.callWS<LovelaceResource>({
    type: "lovelace/resources/create",
    ...values,
  });

export const updateResource = (
  hass: HomeAssistant,
  values: LovelaceResourcesMutableParams
) =>
  hass.callWS<LovelaceResource>({
    type: "lovelace/resources/update",
    ...values,
  });

export const deleteResource = (hass: HomeAssistant, id: string) =>
  hass.callWS({
    type: "lovelace/resources/delete",
    resource_id: id,
  });
