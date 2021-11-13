import { LitElement, PropertyValues } from "lit";
import { property } from "lit/decorators";
import { HomeAssistant, Route } from "../../../homeassistant-frontend/src/types";

import { Hacs } from "../../data/hacs";

export class HacsDialogBase extends LitElement {
  @property({ attribute: false }) public hacs!: Hacs;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public route!: Route;

  @property({ type: Boolean }) public active = false;

  @property({ type: Boolean }) public secondary = false;

  @property({ type: Boolean }) public loading = true;

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
      changedProperties.has("_progress") ||
      changedProperties.has("_releaseNotes") ||
      changedProperties.has("_updating")
    );
  }

  public connectedCallback() {
    super.connectedCallback();
    this.sidebarDocked = window.localStorage.getItem("dockedSidebar") === '"docked"';
  }
}
