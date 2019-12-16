import { LitElement, CSSResultArray, property } from "lit-element";
import { HacsStyle } from "../../style/hacs-style";
import { Repository, Status } from "../../types";
import { HomeAssistant } from "custom-card-helpers";

export class HacsRepositoryButton extends LitElement {
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public repository!: Repository;
  @property({ type: Object }) public status!: Status;

  static get styles(): CSSResultArray {
    return HacsStyle;
  }
}
