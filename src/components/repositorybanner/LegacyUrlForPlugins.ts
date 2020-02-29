import { customElement, TemplateResult, html, property } from "lit-element";

import { HacsRepositoryBanner } from "./HacsRepositoryBanner";
import { LovelaceResourceConfig } from "../../data";

@customElement("hacs-legacy-url-for-plugins")
export class HacsLegacyUrlForPlugins extends HacsRepositoryBanner {
  @property() private _wrongURL: LovelaceResourceConfig[] = [];
  protected render(): TemplateResult | void {
    if (this.status.lovelace_mode === "yaml") return html``;
    const title = "Legacy URL's detected";
    const resources = this.lovelaceconfig as LovelaceResourceConfig[];

    if (!resources) return html``;

    this._wrongURL = resources?.filter(resource => {
      return resource.url.startsWith("/community_plugin");
    });

    if (this._wrongURL.length === 0) return html``;
    if (this.hass.config.version.split(".")[1] <= "106") return html``;

    return html`
      <ha-card class="info" .header="${title}">
        <div class="card-content">
          You have plugins resources in your lovelace configuration that still
          uses the old "/community_plugin" URL and not the new "/hacsfiles"
        </div>
        <div class="card-actions">
          <mwc-button @click=${this.UpdateResources}>
            Update resources
          </mwc-button>
        </div>
      </ha-card>
    `;
  }

  async UpdateResources() {
    this._wrongURL.forEach(resource => {
      const url = resource.url.replace("/community_plugin", "/hacsfiles");
      this.hass.callWS({
        type: "lovelace/resources/update",
        resource_id: resource.id,
        url
      });
    });
    this.dispatchEvent(
      new CustomEvent("hacs-force-reload", { bubbles: true, composed: true })
    );
  }
}
