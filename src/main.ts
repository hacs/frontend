import {
    LitElement,
    TemplateResult,
    html,
    customElement,
    property
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";

import { Route } from "./types";
import './HacsFrontend'


@customElement("hacs-frontend")
class HacsFrontend extends LitElement {
    @property() public hass!: HomeAssistant;
    @property() public route!: Route;
    @property() public narrow!: boolean;

    protected render(): TemplateResult | void {
        return html`
        <hacs-frontendbase .hass=${this.hass} .route=${this.route} .narrow=${this.narrow}>
        </hacs-frontendbase>
        `
    }
}