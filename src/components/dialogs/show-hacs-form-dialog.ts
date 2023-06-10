import { fireEvent } from "../../../homeassistant-frontend/src/common/dom/fire_event";
import type {
  HaFormDataContainer,
  HaFormSchema,
} from "../../../homeassistant-frontend/src/components/ha-form/types";
import type { Hacs } from "../../data/hacs";

export interface HacsFormDialogParams {
  hacs: Hacs;
  title: string;
  schema: readonly HaFormSchema[];
  data: HaFormDataContainer;
  saveLabel?: string;
  computeLabelCallback?: (schema: any, data: HaFormDataContainer) => string;
  computeHelper?: (schema: any) => string | undefined;
  computeError?: (schema: any, error) => string;
  saveAction?: <T>(data: T) => Promise<void>;
}

export const showRegistriesDialog = (
  element: HTMLElement,
  dialogParams: HacsFormDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "hacs-form-dialog",
    dialogImport: () => import("./hacs-form-dialog"),
    dialogParams,
  });
};
