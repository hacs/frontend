import { fireEvent } from "../../../homeassistant-frontend/src/common/dom/fire_event";
import type { Hacs } from "../../data/hacs";
import type { RepositoryInfo } from "../../data/repository";

export interface HacsDownloadDialogParams {
  hacs: Hacs;
  repositoryId: string;
  repository?: RepositoryInfo;
}

export const showHacsDownloadDialog = (
  element: HTMLElement,
  dialogParams: HacsDownloadDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "hacs-download-dialog",
    dialogImport: () => import("./hacs-download-dialog"),
    dialogParams,
  });
};
