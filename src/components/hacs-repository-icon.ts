import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  TemplateResult,
  property,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";

import { Repository } from "../data/repository";

@customElement("hacs-repository-icon")
export class HacsRepositoryIcon extends LitElement {
  @property public repository!: Repository;
  protected render(): TemplateResult | void {
    if (repository.has_icon_url) {
      return html`<div class="icon"></div>`;
    }
    return html` <div class="icon">
      <ha-icon icon="mdi:cube"></ha-icon>
    </div>`;
  }

  static get styles(): CSSResult {
    return css``;
  }
}
