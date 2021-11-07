import "@material/mwc-button/mwc-button";
import { mdiDelete, mdiGithub } from "@mdi/js";
import { css, html, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { computeRTL } from "../../../homeassistant-frontend/src/common/util/compute_rtl";
import "../../../homeassistant-frontend/src/components/ha-alert";
import "../../../homeassistant-frontend/src/components/ha-circular-progress";
import "../../../homeassistant-frontend/src/components/ha-form/ha-form";
import type { HaFormSchema } from "../../../homeassistant-frontend/src/components/ha-form/types";
import "../../../homeassistant-frontend/src/components/ha-settings-row";
import "../../../homeassistant-frontend/src/components/ha-svg-icon";
import { getRepositories, repositoryAdd, repositoryDelete } from "../../data/websocket";
import { scrollBarStyle } from "../../styles/element-styles";
import { HacsStyles } from "../../styles/hacs-common-style";
import "./hacs-dialog";
import { HacsDialogBase } from "./hacs-dialog-base";

@customElement("hacs-custom-repositories-dialog")
export class HacsCustomRepositoriesDialog extends HacsDialogBase {
  @property() private _error: any;

  @state() private _progress = false;

  @state() private _addRepositoryData = { category: undefined, repository: undefined };

  shouldUpdate(changedProperties: PropertyValues) {
    return (
      changedProperties.has("narrow") ||
      changedProperties.has("active") ||
      changedProperties.has("_error") ||
      changedProperties.has("_addRepositoryData") ||
      changedProperties.has("_progress") ||
      changedProperties.has("repositories")
    );
  }

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    const repositories = this.repositories?.filter((repo) => repo.custom);
    const addRepositorySchema: HaFormSchema[] = [
      {
        type: "string",
        name: "repository",
      },
      {
        type: "select",
        name: "category",
        optional: true,
        options: this.hacs.configuration.categories.map((category) => [
          category,
          this.hacs.localize(`common.${category}`),
        ]),
      },
    ];
    return html`
      <hacs-dialog
        .active=${this.active}
        .hass=${this.hass}
        .title=${this.hacs.localize("dialog_custom_repositories.title")}
        scrimClickAction
        escapeKeyAction
      >
        <div class="content">
          <div class="list">
            ${this._error?.message
              ? html`<ha-alert alert-type="error" .rtl=${computeRTL(this.hass)}>
                  ${this._error.message}
                </ha-alert>`
              : ""}
            ${repositories
              ?.filter((repo) => this.hacs.configuration.categories.includes(repo.category))
              .map(
                (repo) => html`<ha-settings-row
                  @click=${() => this._showReopsitoryInfo(String(repo.id))}
                >
                  ${!this.narrow
                    ? html`<ha-svg-icon slot="prefix" .path=${mdiGithub}></ha-svg-icon>`
                    : ""}
                  <span slot="heading">${repo.name}</span>
                  <span slot="description">${repo.full_name} (${repo.category})</span>

                  <mwc-icon-button
                    @click=${(ev) => {
                      ev.stopPropagation();
                      this._removeRepository(repo.id);
                    }}
                  >
                    <ha-svg-icon class="delete" .path=${mdiDelete}></ha-svg-icon>
                  </mwc-icon-button>
                </ha-settings-row>`
              )}
          </div>
          <ha-form
            ?narrow=${this.narrow}
            .data=${this._addRepositoryData}
            .schema=${addRepositorySchema}
            .computeLabel=${(schema: HaFormSchema) =>
              schema.name === "category"
                ? this.hacs.localize("dialog_custom_repositories.category")
                : this.hacs.localize("common.repository")}
            @value-changed=${this._valueChanged}
          >
          </ha-form>
        </div>
        <mwc-button
          slot="primaryaction"
          raised
          .disabled=${this._addRepositoryData.category === undefined ||
          this._addRepositoryData.repository === undefined}
          @click=${this._addRepository}
        >
          ${this._progress
            ? html`<ha-circular-progress active size="small"></ha-circular-progress>`
            : this.hacs.localize("common.add")}
        </mwc-button>
      </hacs-dialog>
    `;
  }

  protected firstUpdated() {
    this.hass.connection.subscribeEvents((msg) => (this._error = (msg as any).data), "hacs/error");
  }

  private _valueChanged(ev) {
    this._addRepositoryData = ev.detail.value;
  }

  private async _addRepository() {
    this._error = undefined;
    this._progress = true;
    if (!this._addRepositoryData.category) {
      this._error = {
        message: this.hacs.localize("dialog_custom_repositories.no_category"),
      };
      return;
    }
    if (!this._addRepositoryData.repository) {
      this._error = {
        message: this.hacs.localize("dialog_custom_repositories.no_repository"),
      };
      return;
    }
    await repositoryAdd(
      this.hass,
      this._addRepositoryData.repository,
      this._addRepositoryData.category
    );
    this.repositories = await getRepositories(this.hass);
    this._progress = false;
  }

  private async _removeRepository(repository: string) {
    this._error = undefined;
    await repositoryDelete(this.hass, repository);
    this.repositories = await getRepositories(this.hass);
  }

  private async _showReopsitoryInfo(repository: string) {
    this.dispatchEvent(
      new CustomEvent("hacs-dialog-secondary", {
        detail: {
          type: "repository-info",
          repository,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  static get styles() {
    return [
      scrollBarStyle,
      HacsStyles,
      css`
        .list {
          position: relative;
          max-height: 870px;
          overflow: auto;
        }
        ha-form {
          display: block;
          padding: 25px 0;
        }
        ha-form[narrow] {
          bottom: 0;
          position: absolute;
          width: calc(100% - 48px);
        }
        ha-svg-icon {
          --mdc-icon-size: 36px;
        }
        ha-svg-icon:not(.delete) {
          margin-right: 4px;
        }
        ha-settings-row {
          cursor: pointer;
          padding: 0;
        }
        .delete {
          color: var(--hcv-color-error);
        }
      `,
    ];
  }
}
