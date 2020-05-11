import { customElement, TemplateResult, html } from "lit-element";

import { HacsRepositoryBanner } from "./HacsRepositoryBanner";
import { AddedToLovelace } from "../../misc/AddedToLovelace";

@customElement("hacs-repository-banner-plugin-not-loaded")
export class RepositoryBannerPluginNotLoaded extends HacsRepositoryBanner {
  protected render(): TemplateResult | void {
    const title = this.hacs.localize("repository_banner.not_loaded");
    const loaded: boolean = AddedToLovelace(
      this.repository,
      this.lovelaceconfig,
      this.status
    );

    if (loaded) return html``;

    return html`
      <ha-card class="info" .header="${title}">
        <div class="card-content">
          ${this.hacs.localize("repository_banner.plugin_not_loaded")}
        </div>
        <div class="card-actions">
          <hacs-button-add-to-lovelace
            .hacs=${this.hacs}
            .hass=${this.hass}
            .repository=${this.repository}
            .route=${this.route}
          ></hacs-button-add-to-lovelace>
        </div>
      </ha-card>
    `;
  }
}
