import { LitElement, CSSResultArray, TemplateResult, html, css, customElement } from "lit-element";
import { HacsStyle } from "../style/hacs-style"

@customElement("hacs-help-button")
export class HacsHelpButton extends LitElement {
    protected render(): TemplateResult | void {
        return html`
        <a href="#">
            <ha-icon
                title="Documentation"
                class="float"
                icon="mdi:help"
                @click=${this.openHelp}>
            </ha-icon>
        </a>
        `
    }

    openHelp() {
        const base = "https://hacs.xyz/docs/navigation/"
        var location = window.location.pathname.split("/")[2];
        if (location === "integration") location = "stores";
        if (location === "plugin") location = "stores";
        if (location === "appdaemon") location = "stores";
        if (location === "python_script") location = "stores";
        if (location === "theme") location = "stores";
        window.open(`${base}${location}`, "Help", "noreferrer")
    }

    static get styles(): CSSResultArray {
        return [HacsStyle, css`
            .float{
                position: fixed;
                width: 36px;
                height:36px;
                bottom: 24px;
                right: 24px;
                border-radius: 50px;
                border: 4px solid var(--accent-color);
                text-align: center;
                color: var(--paper-card-background-color, var(--primary-background-color));
                background-color: var(--accent-color);
            }
        `]
    }
}