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

    setModalCSS() {
        if (document.getElementById("modal-style")) return;
        var element = document.body;
        var style = document.createElement('style');
        style.id = "modal-style"
        style.innerHTML = `
            .swal-modal {
                background-color: var(--primary-background-color) !important;
            }
            .swal-text {
                color: var(--primary-text-color) !important;
            }
            .swal-button {
                background-color: var(--primary-color) !important;
                color: var(--primary-text-color) !important;
            }
          `
        element.appendChild(style)
    }

    protected render(): TemplateResult | void {
        this.setModalCSS()
        return html`
        <hacs-frontendbase .hass=${this.hass} .route=${this.route} .narrow=${this.narrow}>
        </hacs-frontendbase>
        `
    }
}