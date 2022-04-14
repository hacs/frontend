import { LitElement, PropertyValues } from "lit";
import { property } from "lit/decorators";
import { Hacs } from "./data/hacs";
import { sectionsEnabled } from "./panels/hacs-sections";
import { addedToLovelace } from "./tools/added-to-lovelace";
import { HacsLogger } from "./tools/hacs-logger";
import { localize } from "./localize/localize";
import { ProvideHassLitMixin } from "../homeassistant-frontend/src/mixins/provide-hass-lit-mixin";

export class HacsElement extends ProvideHassLitMixin(LitElement) {
  @property({ attribute: false }) public hacs!: Hacs;

  public connectedCallback() {
    super.connectedCallback();

    if (this.hacs === undefined) {
      this.hacs = {
        language: "en",
        messages: [],
        updates: [],
        resources: [],
        repositories: [],
        removed: [],
        sections: [],
        configuration: {} as any,
        status: {} as any,
        addedToLovelace,
        localize: (string: string, replace?: Record<string, any>) =>
          localize(this.hacs?.language || "en", string, replace),
        log: new HacsLogger(),
      };
    }

    this.addEventListener("update-hacs", (e) =>
      this._updateHacs((e as any).detail as Partial<Hacs>)
    );
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

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (this.hacs.language && this.hacs.configuration) {
      this.hacs.sections = sectionsEnabled(this.hacs.language, this.hacs.configuration);
    }
  }
}
