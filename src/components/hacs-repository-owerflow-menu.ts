import {
  mdiAlert,
  mdiAlertCircleOutline,
  mdiArrowDownCircle,
  mdiClose,
  mdiGithub,
  mdiInformation,
  mdiLanguageJavascript,
  mdiReload,
} from "@mdi/js";
import memoizeOne from "memoize-one";
import { mainWindow } from "../../homeassistant-frontend/src/common/dom/get_main_window";
import { navigate } from "../../homeassistant-frontend/src/common/navigate";
import { getConfigEntries } from "../../homeassistant-frontend/src/data/config_entries";
import {
  deleteResource,
  fetchResources,
} from "../../homeassistant-frontend/src/data/lovelace/resource";
import { showConfirmationDialog } from "../../homeassistant-frontend/src/dialogs/generic/show-dialog-box";
import type { RepositoryBase } from "../data/repository";
import { repositoryUninstall, repositoryUpdate } from "../data/websocket";
import type { HacsDashboard } from "../dashboards/hacs-dashboard";
import type { HacsRepositoryDashboard } from "../dashboards/hacs-repository-dashboard";
import { showHacsDownloadDialog, showHacsFormDialog } from "./dialogs/show-hacs-dialog";

export const repositoryMenuItems = memoizeOne(
  (element: HacsRepositoryDashboard | HacsDashboard, repository: RepositoryBase) => [
    ...(element.nodeName === "HACS-EXPERIMENTAL-PANEL"
      ? [
          {
            path: mdiInformation,
            label: element.hacs.localize("common.show"),
            action: () => navigate(`/hacs/repository/${repository.id}`),
          },
        ]
      : []),
    {
      path: mdiGithub,
      label: element.hacs.localize("common.repository"),
      action: () =>
        mainWindow.open(`https://github.com/${repository.full_name}`, "_blank", "noreferrer=true"),
    },
    {
      path: mdiArrowDownCircle,
      label: element.hacs.localize("repository_card.update_information"),
      action: async () => {
        await repositoryUpdate(element.hass, String(repository.id));
      },
    },

    ...(repository.installed_version
      ? [
          {
            path: mdiReload,
            label: element.hacs.localize("repository_card.redownload"),
            action: () =>
              showHacsDownloadDialog(element, { hacs: element.hacs, repositoryId: repository.id }),
            hideForUninstalled: true,
          },
        ]
      : []),
    ...(repository.category === "plugin" && repository.installed_version
      ? [
          {
            path: mdiLanguageJavascript,
            label: element.hacs.localize("repository_card.open_source"),
            action: () =>
              mainWindow.open(
                `/hacsfiles/${repository.local_path.split("/").pop()}/${repository.file_name}`,
                "_blank",
                "noreferrer=true",
              ),
          },
        ]
      : []),
    { divider: true },
    {
      path: mdiAlertCircleOutline,
      label: element.hacs.localize("repository_card.open_issue"),
      action: () =>
        mainWindow.open(
          `https://github.com/${repository.full_name}/issues`,
          "_blank",
          "noreferrer=true",
        ),
    },
    ...(repository.id !== "172733314" && repository.installed_version
      ? [
          {
            path: mdiAlert,
            label: element.hacs.localize("repository_card.report"),
            action: () =>
              mainWindow.open(
                `https://github.com/hacs/integration/issues/new?assignees=ludeeus&labels=flag&template=removal.yml&repo=${repository.full_name}&title=Request for removal of ${repository.full_name}`,
                "_blank",
                "noreferrer=true",
              ),
            warning: true,
          },
          {
            path: mdiClose,
            label: element.hacs.localize("common.remove"),
            action: async () => {
              if (repository.category === "integration" && repository.config_flow) {
                const configFlows = (await getConfigEntries(element.hass)).some(
                  (entry) => entry.domain === repository.domain,
                );
                if (configFlows) {
                  const ignore = await showConfirmationDialog(element, {
                    title: element.hacs.localize("dialog.configured.title"),
                    text: element.hacs.localize("dialog.configured.message", {
                      name: repository.name,
                    }),
                    dismissText: element.hacs.localize("common.ignore"),
                    confirmText: element.hacs.localize("common.navigate"),
                    confirm: () => {
                      navigate("/config/integrations", { replace: true });
                    },
                  });
                  if (ignore) {
                    return;
                  }
                }
              }
              showHacsFormDialog(element, {
                hacs: element.hacs,
                title: element.hacs.localize("dialog.remove.title"),
                saveLabel: element.hacs.localize("dialog.remove.title"),
                description: element.hacs.localize("dialog.remove.message", {
                  name: repository.name,
                }),
                saveAction: async () => {
                  await _repositoryRemove(element, repository);
                },
                destructive: true,
              });
            },
            warning: true,
          },
        ]
      : []),
  ],
);

const _repositoryRemove = async (
  element: HacsRepositoryDashboard | HacsDashboard,
  repository: RepositoryBase,
) => {
  if (repository.category === "plugin" && element.hacs.info?.lovelace_mode !== "yaml") {
    const resources = await fetchResources(element.hass.connection);
    resources
      .filter((resource) =>
        resource.url.startsWith(
          `/hacsfiles/${repository.full_name.split("/")[1]}/${repository.file_name}`,
        ),
      )
      .forEach(async (resource) => {
        await deleteResource(element.hass, String(resource.id));
      });
  }
  await repositoryUninstall(element.hass, String(repository.id));
  if (element.nodeName === "HACS-REPOSITORY-PANEL") {
    history.back();
  }
};
