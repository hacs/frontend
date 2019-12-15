import {
    LitElement,
    CSSResultArray,
    TemplateResult,
    html,
    customElement,
    css,
    property
} from "lit-element";

import { HacsStyle } from "../style/hacs-style"
import { Repository } from "../types"

import "../components/HacsBody"
import "../components/HacsProgressbar"


@customElement("hacs-repository")
export class HacsRepository extends LitElement {
    @property() public repositories!: Repository[];
    @property() public repository!: string;

    protected render(): TemplateResult | void {
        if (this.repositories === undefined) return html`
            <hacs-progressbar></hacs-progressbar>
        `
        const repo_target = this.repository
        var filter = this.repositories.filter(function (repo) {
            if (repo.id === repo_target) return true;
            return false;
        })

        const repository: Repository = filter[0]

        return html`
        <hacs-body>
            <ha-card .header=${repository.name}>
            </ha-card>
        </hacs-body>
        `
    }

    static get styles(): CSSResultArray {
        return [
            HacsStyle,
            css`
            .loader {
                background-color: var(--primary-background-color);
                height: 100%;
                width: 100%;
              }

            `]
    }
}