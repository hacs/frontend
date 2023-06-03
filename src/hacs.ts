import { LitElement, PropertyValues } from "lit";
import { property, state } from "lit/decorators";
import { Hacs } from "./data/hacs";
import { addedToLovelace } from "./tools/added-to-lovelace";
import { HacsLogger } from "./tools/hacs-logger";
import { HacsLocalizeKeys } from "./data/localize";
import { ProvideHassLitMixin } from "../homeassistant-frontend/src/mixins/provide-hass-lit-mixin";
import { HomeAssistant } from "../homeassistant-frontend/src/types";
import { computeLocalize } from "../homeassistant-frontend/src/common/translations/localize";
import { getTranslation } from "../homeassistant-frontend/src/util/common-translation";

const ALWAYS_UPDATE = new Set(["localize"]);

export class HacsElement extends ProvideHassLitMixin(LitElement) {
  @property({ attribute: false }) public hacs: Partial<Hacs> = {
    language: "en",
    repositories: [],
    info: {} as any,
    addedToLovelace,
    log: new HacsLogger(),
  };

  @state() private _language = "en";

  public connectedCallback() {
    super.connectedCallback();

    this._initializeLocalize();

    this.addEventListener("update-hacs", (e) =>
      this._updateHacs((e as any).detail as Partial<Hacs>)
    );
  }

  protected willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has("hass")) {
      const oldHass = changedProperties.get("hass") as HomeAssistant | undefined;
      if (oldHass?.language !== this.hass.language) {
        this._language = this.hass.language;
        this.hacs.language = this.hass.language;
      }
    }

    if (changedProperties.has("_language")) {
      this._initializeLocalize();
    }
  }

  private async _initializeLocalize() {
    const { language, data } = await getTranslation(null, this._language);

    this._updateHacs({
      localize: await computeLocalize<HacsLocalizeKeys>(this.constructor.prototype, language, {
        [language]: data,
      }),
    });
  }

  protected _updateHacs(obj: Partial<Hacs>) {
    if (
      Object.keys(obj).some(
        (key) =>
          ALWAYS_UPDATE.has(key) || JSON.stringify(this.hacs[key] !== JSON.stringify(obj[key]))
      )
    ) {
      this.hacs = { ...this.hacs, ...obj };
    }
  }
}
