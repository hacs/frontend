import { LitElement, CSSResultArray, property } from "lit-element";
import { HacsStyle } from "../../style/hacs-style"
import { Repository } from "../../types";
import { HomeAssistant } from "custom-card-helpers";

export class HacsRepositoryButton extends LitElement {
    @property() public hass!: HomeAssistant;
    @property() public repository!: Repository;

    static get styles(): CSSResultArray {
        return HacsStyle
    }
}