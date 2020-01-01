import { customElement, TemplateResult, html } from "lit-element";

import { HacsRepositoryBanner } from "./HacsRepositoryBanner";

@customElement("hacs-repository-banner-integration-first-install")
export class RepositoryBannerIntegrationFirstInstall extends HacsRepositoryBanner {
  protected render(): TemplateResult | void {
    const title = this.hacs.localize("repository_banner.restart_pending");

    return html`
      <ha-card class="info" .header="${title}">
        <div class="card-content">
          ${this.hacs.localize("repository_banner.restart")}
          </br></br>
          ${this.hacs.localize("repository_banner.restart")}
          ${this.hacs.localize("repository_banner.config_flow")}
          </br>
          ${this.hacs.localize("repository_banner.no_restart_required")} 🎉
        </div>
        <div class="card-actions">
          <hacs-button-restart-home-assistant
            .hacs=${this.hacs}
            .hass=${this.hass}
            .route=${this.route}
          ></hacs-button-restart-home-assistant>
          <hacs-button-goto-integrations
            .hacs=${this.hacs}
            .route=${this.route}
          ></hacs-button-goto-integrations>
        </div>
      </ha-card>
    `;
  }
}
