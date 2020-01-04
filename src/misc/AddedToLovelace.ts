import {
  RepositoryData,
  Status,
  LovelaceConfig,
  LovelaceResourceConfig
} from "../data";

export function AddedToLovelace(
  repository: RepositoryData,
  lovelaceconfig: LovelaceConfig,
  status: Status
): boolean {
  if (status.lovelace_mode === "yaml") return true;
  if (lovelaceconfig !== undefined) {
    var loaded: boolean = false;
    var URL: string = `/community_plugin/${
      repository.full_name.split("/")[1]
    }/${repository.file_name}`;

    if (lovelaceconfig.resources !== undefined) {
      lovelaceconfig.resources.forEach((item: LovelaceResourceConfig) => {
        if (!loaded) {
          if (item.url === URL) loaded = true;
        }
      });
    }
    return loaded;
  } else return true;
}
