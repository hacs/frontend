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

import { sections } from "./hacs-sections";

@customElement("hacs-store-panel")
export class HacsStorePanel extends LitElement {
  @property({ attribute: false }) public configuration: Configuration;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public route!: Route;
  @property({ attribute: false }) public repositories: Repository[];
  @property({ attribute: false }) public lovelace: LovelaceResource[];

  protected render(): TemplateResult | void {
    const selectedSection = this.route.path.split("/")[1];
    const repositories = this.repositories?.filter((repo) =>
      sections.panels
        .find((section) => section.id === selectedSection)
        .categories.includes(repo.category)
    );
    return html`<hacs-tabbed-layout
      .hass=${this.hass}
      .tabs=${sections.panels}
      .route=${this.route}
      .selected=${selectedSection}
    >
      ${repositories?.map(
        (repo) => html`<ha-card .header=${repo.name}></ha-card>`
      )}
    </hacs-tabbed-layout>`;
  }

  static get styles() {
    return css``;
  }
}
