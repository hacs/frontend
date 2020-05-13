import {
  LitElement,
  customElement,
  property,
  html,
  css,
  TemplateResult,
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";
import {
  Route,
  Configuration,
  Repository,
  LovelaceResource,
} from "../data/common";
import "../layout/hacs-tabbed-layout";
import "../components/hacs-tabbed-menu";

import { sections } from "./hacs-sections";

@customElement("hacs-settings-panel")
export class HacsSettingsPanel extends LitElement {
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public repositories!: Repository[];
  @property({ attribute: false }) public lovelace: LovelaceResource[];

  protected render(): TemplateResult | void {
    return html`<hacs-tabbed-layout
      .hass=${this.hass}
      .tabs=${sections.panels}
      .route=${this.route}
      selected="settings"
      ><hacs-tabbed-menu
        slot="toolbar-icon"
        .hass=${this.hass}
        .route=${this.route}
        .narrow=${this.narrow}
        .configuration=${this.configuration}
        .lovelace=${this.lovelace}
        .repositories=${this.repositories}
      ></hacs-tabbed-menu>
    </hacs-tabbed-layout>`;
  }

  static get styles() {
    return css``;
  }
}
