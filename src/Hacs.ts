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
  RelativeTimeSince(target: any): string;
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
  RelativeTimeSince(target: any): string {
    const current: any = new Date();

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - target;

    var value: number;

    if (elapsed < msPerMinute) {
      value = Math.round(elapsed / 1000);
      return `${
        value === 1 ? this.localize(`time.one`) : value
      } ${this.localize(
        `time.second${value === 1 ? "" : "s"}`
      )} ${this.localize(`time.ago`)}`;
    } else if (elapsed < msPerHour) {
      value = Math.round(elapsed / msPerMinute);
      return `${
        value === 1 ? this.localize(`time.one`) : value
      } ${this.localize(
        `time.minute${value === 1 ? "" : "s"}`
      )} ${this.localize(`time.ago`)}`;
    } else if (elapsed < msPerDay) {
      value = Math.round(elapsed / msPerHour);
      return `${
        value === 1 ? this.localize(`time.one`) : value
      } ${this.localize(`time.hour${value === 1 ? "" : "s"}`)} ${this.localize(
        `time.ago`
      )}`;
    } else if (elapsed < msPerMonth) {
      value = Math.round(elapsed / msPerDay);
      return `${
        value === 1 ? this.localize(`time.one`) : value
      } ${this.localize(`time.day${value === 1 ? "" : "s"}`)} ${this.localize(
        `time.ago`
      )}`;
    } else if (elapsed < msPerYear) {
      value = Math.round(elapsed / msPerMonth);
      return `${
        value === 1 ? this.localize(`time.one`) : value
      } ${this.localize(`time.month${value === 1 ? "" : "s"}`)} ${this.localize(
        `time.ago`
      )}`;
    } else {
      value = Math.round(elapsed / msPerYear);
      return `${
        value === 1 ? this.localize(`time.one`) : value
      } ${this.localize(`time.year${value === 1 ? "" : "s"}`)} ${this.localize(
        `time.ago`
      )}`;
    }
  }
}
