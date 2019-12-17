/* HACS Helper
The reason for this is that every items is not needed to be imported or passed to every file.
Instead common functions/objects are stored in the Hacs class.
*/
import { HomeAssistant } from "custom-card-helpers";
import { localize } from "./localize/localize";
import {
  navigate,
  scrollToTarget,
  isnullorempty,
  RepositoryWebSocketAction
} from "./tools";

export interface HACS {
  localize?(string: string, search?: string, replace?: string): string;
  scrollToTarget(element: any, target: any): void;
  navigate?(_node: any, path: string): any;
  isnullorempty?(test: any): boolean;
}

export class Hacs {
  localize = function(str: string, s?: string, r?: string): string {
    return localize(str, s, r);
  };

  scrollToTarget = function(element: any, target: any): void {
    scrollToTarget(element, target);
  };

  navigate = (_node: any, path: string) => {
    navigate(_node, path);
  };

  isnullorempty = function(test: any): boolean {
    return isnullorempty(test);
  };
  RepositoryWebSocketAction = function(
    hass: HomeAssistant,
    repository: string,
    Action: string,
    Data?: any
  ): void {
    RepositoryWebSocketAction(hass, repository, Action, Data);
  };
}
