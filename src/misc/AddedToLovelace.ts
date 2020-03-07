import {
  RepositoryData,
  Status,
  LovelaceConfig,
  LovelaceResourceConfig
} from "../data";

export function AddedToLovelace(
  repository: RepositoryData,
  lovelaceconfig: LovelaceConfig | LovelaceResourceConfig[],
  status: Status
): boolean {
  if (status.lovelace_mode === "yaml") return true;
  if (lovelaceconfig) {
    var loaded: boolean = false;
    var URL1: string = `/community_plugin/${
      repository.full_name.split("/")[1]
    }/${repository.file_name}`;
    var URL2: string = `/hacsfiles/${repository.full_name.split("/")[1]}/${
      repository.file_name
    }`;
    let resources = lovelaceconfig;
    if (lovelaceconfig.hasOwnProperty("resources")) {
      resources = (lovelaceconfig as LovelaceConfig).resources;
    } else if (lovelaceconfig.hasOwnProperty("views")) {
      resources = [];
    }

    if (resources) {
      (resources as LovelaceResourceConfig[]).forEach(
        (item: LovelaceResourceConfig) => {
          if (item.url === URL1 || item.url === URL2) loaded = true;
        }
      );
    }
    return loaded;
  } else return true;
}
