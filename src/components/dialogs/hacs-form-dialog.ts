import { CSSResultGroup, LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import "../../../homeassistant-frontend/src/components/ha-dialog";
import { createCloseHeading } from "../../../homeassistant-frontend/src/components/ha-dialog";
import "../../../homeassistant-frontend/src/components/ha-form/ha-form";
import type {
  HaFormDataContainer,
  HaFormSchema,
} from "../../../homeassistant-frontend/src/components/ha-form/types";
import type { HomeAssistant } from "../../../homeassistant-frontend/src/types";
import type { HacsFormDialogParams } from "./show-hacs-form-dialog";

@customElement("hacs-form-dialog")
class HacsFromDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() _dialogParams?: HacsFormDialogParams;

  @state() _waiting?: boolean;

  @state() _errors?: Record<string, string>;

  public async showDialog(dialogParams: HacsFormDialogParams): Promise<void> {
    this._dialogParams = dialogParams;
    await this.updateComplete;
  }

  public closeDialog(): void {
    this._dialogParams = undefined;
    this._waiting = undefined;
  }

  protected render() {
    if (!this._dialogParams) {
      return nothing;
    }
    return html`
      <ha-dialog
        open
        .scrimClickAction=${this._dialogParams.saveAction !== undefined}
        .escapeKeyAction=${this._dialogParams.saveAction !== undefined}
        .heading=${this._dialogParams.saveAction === undefined
          ? createCloseHeading(this.hass, this._dialogParams.title)
          : this._dialogParams.title}
        @closed=${this.closeDialog}
      >
        ${this._dialogParams.description || nothing}
        <ha-form
          .hass=${this.hass}
          .data=${this._dialogParams.data || {}}
          .schema=${this._dialogParams.schema || []}
          .error=${this._errors}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          .computeError=${this._computeError}
          @value-changed=${this._valueChanged}
          dialogInitialFocus
        ></ha-form>
        ${this._dialogParams.saveAction
          ? html`<mwc-button slot="secondaryAction" @click=${this.closeDialog} dialogInitialFocus>
                ${this._dialogParams.hacs.localize("common.cancel")}
              </mwc-button>
              <mwc-button
                .disabled=${this._waiting || !this._dialogParams.data}
                slot="primaryAction"
                @click=${this._saveClicked}
              >
                ${this._dialogParams.saveLabel || this._dialogParams.hacs.localize("common.save")}
              </mwc-button>`
          : nothing}
      </ha-dialog>
    `;
  }

  private _valueChanged(ev: CustomEvent) {
    this._dialogParams!.data = ev.detail.value;
  }

  public async _saveClicked(): Promise<void> {
    if (!this._dialogParams?.saveAction) {
      return;
    }
    this._waiting = true;
    try {
      await this._dialogParams.saveAction(this._dialogParams!.data);
    } catch (err: any) {
      this._errors = { base: err?.message || "Unkown error, check Home Assistant logs" };
      return;
    }
    this.closeDialog();
  }

  private _computeLabel = (schema: HaFormSchema, data: HaFormDataContainer) =>
    this._dialogParams!.computeLabelCallback
      ? this._dialogParams!.computeLabelCallback(schema, data)
      : schema.name || "";

  private _computeHelper = (schema: HaFormSchema) =>
    this._dialogParams!.computeHelper
      ? this._dialogParams!.computeHelper(schema)
      : schema.name || "";

  private _computeError = (error, schema: HaFormSchema | readonly HaFormSchema[]) =>
    this._dialogParams!.computeError
      ? this._dialogParams!.computeError(error, schema)
      : error || "";

  static get styles(): CSSResultGroup {
    return css`
      .root > * {
        display: block;
      }
      .root > *:not([own-margin]):not(:last-child) {
        margin-bottom: 24px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hacs-form-dialog": HacsFromDialog;
  }
}
