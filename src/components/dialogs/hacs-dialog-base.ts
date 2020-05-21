import { LitElement, property, PropertyValues } from "lit-element";
import { HomeAssistant } from "custom-card-helpers";

import {
  Route,
  Critical,
  LovelaceResource,
  Status,
  Configuration,
  Repository,
} from "../../data/common";

export class HacsDialogBase extends LitElement {
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public critical!: Critical[];
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public lovelace: LovelaceResource[];
  @property({ attribute: false }) public repositories: Repository[];
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public status: Status;
  @property({ type: Boolean }) public active: boolean = false;
  @property({ type: Boolean }) public secondary: boolean = false;
  @property({ type: Boolean }) public loading: boolean = true;
  @property({ type: Boolean }) public narrow!: boolean;
  @property({ type: Boolean }) public sidebarDocked!: boolean;

  shouldUpdate(changedProperties: PropertyValues) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "hass") {
        this.sidebarDocked =
          window.localStorage.getItem("dockedSidebar") === '"docked"';
      }
    });
    return (
      changedProperties.has("sidebarDocked") ||
      changedProperties.has("narrow") ||
      changedProperties.has("active") ||
      changedProperties.has("params")
    );
  }
  public connectedCallback() {
    super.connectedCallback();
    this.sidebarDocked =
      window.localStorage.getItem("dockedSidebar") === '"docked"';
  }
}
