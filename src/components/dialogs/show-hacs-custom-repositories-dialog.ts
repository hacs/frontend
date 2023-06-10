import { fireEvent } from "../../../homeassistant-frontend/src/common/dom/fire_event";
import type { Hacs } from "../../data/hacs";

export interface HacsCustomRepositoriesDialogParams {
  hacs: Hacs;
}

export const showHacsCustomRepositoriesDialog = (
  element: HTMLElement,
  dialogParams: HacsCustomRepositoriesDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "hacs-custom-repositories-dialog",
    dialogImport: () => import("./hacs-custom-repositories-dialog"),
    dialogParams,
  });
};
