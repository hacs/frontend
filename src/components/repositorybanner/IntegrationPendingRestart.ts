import { customElement, TemplateResult, html } from "lit-element";

import { HacsRepositoryBanner } from "./HacsRepositoryBanner";

@customElement("hacs-repository-banner-integration-pending-restart")
export class RepositoryBannerIntegrationPendingRestart extends HacsRepositoryBanner {
  protected render(): TemplateResult | void {
    const title = this.hacs.localize("repository_banner.restart_pending");

    return html`
      <ha-card class="info" .header="${title}">
        <div class="card-content">
          ${this.hacs.localize("repository_banner.restart")}
        </div>
        <div class="card-actions">
          <hacs-button-restart-home-assistant
            .hacs=${this.hacs}
            .hass=${this.hass}
            .repository=${this.repository}
            .route=${this.route}
          ></hacs-button-restart-home-assistant>
        </div>
      </ha-card>
    `;
  }
}
