import { LitElement, property, PropertyValues } from "lit-element";
import { HomeAssistant, Route } from "../../../homeassistant-frontend/src/types";
import { Hacs } from "../../data/hacs";

import {
  Critical,
  LovelaceResource,
  Status,
  Configuration,
  Repository,
  RemovedRepository,
} from "../../data/common";

export class HacsDialogBase extends LitElement {
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public hacs: Hacs;
  @property({ attribute: false }) public critical!: Critical[];
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public lovelace: LovelaceResource[];
  @property({ attribute: false }) public repositories: Repository[];
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public status: Status;
  @property({ attribute: false }) public removed: RemovedRepository[];
  @property({ type: Boolean }) public active: boolean = false;
  @property({ type: Boolean }) public secondary: boolean = false;
  @property({ type: Boolean }) public loading: boolean = true;
  @property({ type: Boolean }) public narrow!: boolean;
  @property({ type: Boolean }) public sidebarDocked!: boolean;

  shouldUpdate(changedProperties: PropertyValues) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "hass") {
        this.sidebarDocked = window.localStorage.getItem("dockedSidebar") === '"docked"';
      }
    });
    return (
      changedProperties.has("sidebarDocked") ||
      changedProperties.has("narrow") ||
      changedProperties.has("active") ||
      changedProperties.has("params") ||
      changedProperties.has("_error") ||
      changedProperties.has("_releaseNotes") ||
      changedProperties.has("_updating")
    );
  }
  public connectedCallback() {
    super.connectedCallback();
    this.sidebarDocked = window.localStorage.getItem("dockedSidebar") === '"docked"';
  }
}
