/* HACS Repository Helper
The reason for this is that every items is not needed to be imported or passed to every file.
Instead common functions/objects are stored in the Repository class.
*/
import { HomeAssistant } from "custom-card-helpers";
import { RepositoryWebSocketAction } from "./tools";

import { RepositoryData } from "./data";

export interface Repository {
  data: RepositoryData;
}

export class Repo {
  data!: RepositoryData;
  hass!: HomeAssistant;

  constructor(data: RepositoryData, hass: HomeAssistant) {
    this.data = data;
    this.hass = hass;
  }

  RepositoryWebSocketAction = function (action: string, data?: any): void {
    RepositoryWebSocketAction(this.hass, this, action, data);
  };
}
