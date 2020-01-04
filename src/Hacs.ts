/* HACS Helper
The reason for this is that every items is not needed to be imported or passed to every file.
Instead common functions/objects are stored in the Hacs class.
*/
import { HomeAssistant } from "custom-card-helpers";
import { localize } from "./localize/localize";
import emoji from "node-emoji";
import { markdown } from "./markdown/markdown";
import { Logger } from "./misc/Logger";
import {
  navigate,
  scrollToTarget,
  isnullorempty,
  RepositoryWebSocketAction
} from "./tools";

import { Configuration, RepositoryData, Status } from "./data";

export interface HACS {
  logger: any;
  RepositoryWebSocketAction(
    hass: HomeAssistant,
    repository: string,
    action: string,
    data?: any
  );
  RelativeTimeSince(target: any): string;
  emojify(string: string): string;
  localize?(string: string, search?: string, replace?: string): string;
  scrollToTarget(element: any, target: any): void;
  navigate?(_node: any, path: string): any;
  isnullorempty?(test: any): boolean;
  markdown?(input: string): any;
  set_configuration?(configuration: Configuration): void;
  configuration: Configuration;
  repositories: RepositoryData[];
  status: Status;
}

export class Hacs {
  configuration!: Configuration;
  repositories!: RepositoryData[];
  status!: Status;
  logger = new Logger();

  constructor(
    configuration: Configuration,
    repositories: RepositoryData[],
    status: Status
  ) {
    this.configuration = configuration;
    this.repositories = repositories;
    this.status = status;
  }

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

  markdown = function(input: string): any {
    return markdown.convert(input);
  };

  isnullorempty = function(test: any): boolean {
    return isnullorempty(test);
  };
  RepositoryWebSocketAction = function(
    hass: HomeAssistant,
    repository: string,
    action: string,
    data?: any
  ): void {
    RepositoryWebSocketAction(hass, repository, action, data);
  };
  RelativeTimeSince(input: any): string {
    let current: number = new Date().getTime();
    let target: number = Date.parse(input);
    var value: number;

    const msPerMinute: number = 60 * 1000;
    const msPerHour: number = msPerMinute * 60;
    const msPerDay: number = msPerHour * 24;
    const msPerMonth: number = msPerDay * 30;
    const msPerYear: number = msPerDay * 365;

    const elapsed: number = current - target;

    if (elapsed < msPerMinute) {
      value = Math.round(elapsed / 1000);
      return `${
        value === 1
          ? this.localize(`time.one_second_ago`)
          : this.localize("time.x_seconds_ago", "{x}", String(value))
      }`;
    } else if (elapsed < msPerHour) {
      value = Math.round(elapsed / msPerMinute);
      return `${
        value === 1
          ? this.localize(`time.one_minute_ago`)
          : this.localize("time.x_minutes_ago", "{x}", String(value))
      }`;
    } else if (elapsed < msPerDay) {
      value = Math.round(elapsed / msPerHour);
      return `${
        value === 1
          ? this.localize(`time.one_hour_ago`)
          : this.localize("time.x_hours_ago", "{x}", String(value))
      }`;
    } else if (elapsed < msPerMonth) {
      value = Math.round(elapsed / msPerDay);
      return `${
        value === 1
          ? this.localize(`time.one_day_ago`)
          : this.localize("time.x_days_ago", "{x}", String(value))
      }`;
    } else if (elapsed < msPerYear) {
      value = Math.round(elapsed / msPerMonth);
      return `${
        value === 1
          ? this.localize(`time.one_month_ago`)
          : this.localize("time.x_months_ago", "{x}", String(value))
      }`;
    } else {
      value = Math.round(elapsed / msPerYear);
      return `${
        value === 1
          ? this.localize(`time.one_year_ago`)
          : this.localize("time.x_years_ago", "{x}", String(value))
      }`;
    }
  }
}
