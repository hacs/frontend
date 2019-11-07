import { customElement, TemplateResult, html, property } from "lit-element";
import { HacsRepositoryButton } from "./HacsRepositoryButton"
import { LovelaceConfig } from '../misc/LovelaceTypes'

@customElement("hacs-button-add-to-lovelace")
export class HacsButtonAddToLovelace extends HacsRepositoryButton {
    @property() private LLConfig: LovelaceConfig
    protected render(): TemplateResult | void {
        if (!this.repository.installed) return html``

        return html`
            <mwc-button @click=${this.RepositoryAddToLovelace}>
                Add to Lovelace
            </mwc-button>
        `;
    }

    getLLConfig() {
        this.hass.connection.sendMessagePromise({
            type: 'lovelace/config', force: false
        }).then(
            (resp) => {
                this.LLConfig = (resp as LovelaceConfig);
            },
            (err) => {
                console.error(err)
            }
        );
    }

    RepositoryAddToLovelace() {
        if (!window.confirm(
            "Do you want to add this to your lovelace resources?"
        )) return;
        this.hass.connection.sendMessagePromise({
            type: 'lovelace/config', force: false
        }).then(
            (resp) => {
                var currentConfig = (resp as LovelaceConfig)
                const cardConfig = {
                    "url": (`/community_plugin/${this.repository.full_name.split("/")[1]}/${this.repository.file_name}` as string),
                    "type": (this.repository.javascript_type as "css" | "js" | "module" | "html")
                }
                if (currentConfig.resources) currentConfig.resources!.push(cardConfig);
                else currentConfig.resources = [cardConfig]

                this.hass.callWS({ type: 'lovelace/config/save', config: currentConfig })
            },
            (err) => {
                console.error(err)
            }
        );
    }
}