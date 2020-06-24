import { LitElement, property } from "lit-element";
import { Hacs } from "./data/hacs";
import { sectionsEnabled } from "./panels/hacs-sections";
import { addedToLovelace } from "./tools/added-to-lovelace";
import { localize } from "./localize/localize";

export class HacsElement extends LitElement {
  @property({ type: Object }) public hacs?: Hacs;

  public async connectedCallback() {
    super.connectedCallback();

    this.addEventListener("update-hacs", (e) =>
      this._updateHacs((e as any).detail as Partial<Hacs>)
    );

    if (this.hacs === undefined) {
      // Initialize
      this.hacs = {
        messages: [],
        updates: [],
        resources: [],
        removed: [],
        sections: [],
        configuration: {} as any,
        status: {} as any,
        localize,
        addedToLovelace,
      };
    }
  }

  protected _updateHacs(obj: Partial<Hacs>) {
    let shouldUpdate = false;

    Object.keys(obj).forEach((key) => {
      if (JSON.stringify(this.hacs[key]) !== JSON.stringify(obj[key])) {
        shouldUpdate = true;
      }
    });

    if (shouldUpdate) {
      this.hacs = { ...this.hacs, ...obj };
    }
  }

  protected updated() {
    this.hacs.sections = sectionsEnabled(this.hacs.configuration);
  }
}
