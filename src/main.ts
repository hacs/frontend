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
import "./panels/store"


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

    private get _get_store() {
        return this.route.path.split("/")[1];
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
        <hacs-store .store=${this._get_store} .repositories=${true}></hacs-store>
        ` : "")}

        <hacs-help-button></hacs-help-button>
        </hacs-frontendbase>
        `
    }
}