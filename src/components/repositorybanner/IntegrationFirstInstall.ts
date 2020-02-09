import { customElement, TemplateResult, html } from "lit-element";

import { HacsRepositoryBanner } from "./HacsRepositoryBanner";

@customElement("hacs-repository-banner-integration-first-install")
export class RepositoryBannerIntegrationFirstInstall extends HacsRepositoryBanner {
  protected render(): TemplateResult | void {
    const title = this.hacs.localize("repository_banner.config_flow_title");

    return html`
      <ha-card class="info" .header="${title}">
        <div class="card-content">
          ${this.hacs.localize("repository_banner.config_flow")}
          </br>
          ${this.hacs.localize("repository_banner.no_restart_required")} 🎉
        </div>
        <div class="card-actions">
          <hacs-button-goto-integrations
            .hacs=${this.hacs}
            .route=${this.route}
          ></hacs-button-goto-integrations>
        </div>
      </ha-card>
    `;
  }
}
