import { LitElement, CSSResultArray, TemplateResult, html, css, customElement } from "lit-element";
import { HacsStyle } from "../style/hacs-style"

@customElement("hacs-help-button")
export class HacsHelpButton extends LitElement {
    protected render(): TemplateResult | void {
        return html`
        <a href="#">
            <ha-icon
                title="Help"
                class="float"
                icon="mdi:help-circle-outline"
                @click=${this.openHelp}>
            </ha-icon>
        </a>
        `
    }

    openHelp() {
        const base = "https://hacs.xyz/docs/navigation/"
        var location = window.location.pathname.split("/")[2];
        console.log(location);
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
                width: 60px;
                height:60px;
                bottom: 40px;
                right: 40px;
                border-radius: 50px;
                text-align: center;
                color: var(--accent-color);
                background-color: var(--paper-card-background-color, var(--primary-background-color));
            }
        `]
    }
}