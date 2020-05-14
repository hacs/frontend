import { HomeAssistant } from "custom-card-helpers";
import {
  Configuration,
  Repository,
  Critical,
  Status,
  LovelaceResource,
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
