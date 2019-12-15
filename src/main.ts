import {
    LitElement,
    TemplateResult,
    html,
    customElement,
    property
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";

import { Route, LocationChangedEvent } from "./types";
import './HacsFrontend'
import "./components/buttons/HacsHelpButton";


@customElement("hacs-frontend")
class HacsFrontend extends LitElement {
    @property() public hass!: HomeAssistant;
    @property() public route!: Route;
    @property() public narrow!: boolean;

    locationChanged(e): void {
        this.route = ((e as LocationChangedEvent).detail.value)
        this.requestUpdate();
    }

    protected firstUpdated() {
        this.addEventListener('hacs-location-change', this.locationChanged)
    }


    protected render(): TemplateResult | void {
        return html`
        <hacs-frontendbase .hass=${this.hass} .route=${this.route} .narrow=${this.narrow}>

        ${(this.route.path === "/installed" ? html`
        <h1>installed</h1>
        ` : "")}

        ${(this.route.path === "/settings" ? html`
        <h1>settings</h1>
        ` : "")}

        ${(this.route.path !== "/installed" && this.route.path !== "/settings" ? html`
            <h1>store</h1>
        ` : "")}

        <hacs-help-button></hacs-help-button>
        </hacs-frontendbase>
        `
    }
}