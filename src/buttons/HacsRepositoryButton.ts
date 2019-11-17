import { LitElement, CSSResultArray, property } from "lit-element";
import { HacsStyle } from "../style/hacs-style"
import { Repository, Status } from "../types";
import { HomeAssistant } from "custom-card-helpers";

export class HacsRepositoryButton extends LitElement {
    @property() public hass!: HomeAssistant;
    @property() public repository!: Repository;
    @property() public status!: Status;

    static get styles(): CSSResultArray {
        return HacsStyle
    }
}