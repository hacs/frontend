/* HACS Helper
The reason for this is that every items is not needed to be imported or passed to every file.
Instead common functions/objects are stored in the Hacs class.
*/
import { HomeAssistant } from "custom-card-helpers";
import { localize } from "./localize/localize";
import emoji from "node-emoji";
import {
  navigate,
  scrollToTarget,
  isnullorempty,
  RepositoryWebSocketAction
} from "./tools";

export interface HACS {
  timeDifference(previous: any): string;
  emojify(string: string): string;
  localize?(string: string, search?: string, replace?: string): string;
  scrollToTarget(element: any, target: any): void;
  navigate?(_node: any, path: string): any;
  isnullorempty?(test: any): boolean;
}

export class Hacs {
  localize = function(str: string, s?: string, r?: string): string {
    return localize(str, s, r);
  };

  emojify = function(string: string): string {
    return emoji.emojify(string);
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
  timeDifference(previous: any): string {
    const current: any = new Date();

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
      return (
        Math.round(elapsed / 1000) +
        ` ${this.localize("time.seconds")} ${this.localize("time.ago")}`
      );
    } else if (elapsed < msPerHour) {
      return (
        Math.round(elapsed / msPerMinute) +
        ` ${this.localize("time.minutes")} ${this.localize("time.ago")}`
      );
    } else if (elapsed < msPerDay) {
      return (
        Math.round(elapsed / msPerHour) +
        ` ${this.localize("time.hours")} ${this.localize("time.ago")}`
      );
    } else if (elapsed < msPerMonth) {
      return `${Math.round(elapsed / msPerDay)} ${this.localize(
        "time.days"
      )} ${this.localize("time.ago")}`;
    } else if (elapsed < msPerYear) {
      return `${Math.round(elapsed / msPerMonth)} ${this.localize(
        "time.months"
      )} ${this.localize("time.ago")}`;
    } else {
      return `${Math.round(elapsed / msPerYear)} ${this.localize(
        "time.years"
      )} ${this.localize("time.ago")}`;
    }
  }
}
