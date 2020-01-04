import { LitElement, CSSResultArray, property } from "lit-element";
import { HacsStyle } from "../../style/hacs-style";
import { RepositoryData, Status } from "../../data";
import { HomeAssistant } from "custom-card-helpers";

export class HacsRepositoryButton extends LitElement {
  @property() public hass!: HomeAssistant;
  @property() public repository!: RepositoryData;
  @property() public status!: Status;

  static get styles(): CSSResultArray {
    return HacsStyle;
  }
}
