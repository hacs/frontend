import { css, CSSResultGroup } from "lit";
import { hacsButtonStyle, hacsIconStyle, hacsLinkStyle } from "./element-styles";
import { haStyle } from "../../homeassistant-frontend/src/resources/styles";

export const hacsCommonClasses = css`
  .warning {
    color: var(--hcv-color-warning);
  }
  .pending_update {
    color: var(--hcv-color-update);
  }
  .pending_restart,
  .error,
  .uninstall {
    color: var(--hcv-color-error);
    --mdc-theme-primary: var(--hcv-color-error);
  }
  .header {
    opacity: var(--dark-primary-opacity);
    padding: 8px 0 4px 16px;
  }
`;

export const HacsStyles: CSSResultGroup = [
  haStyle,
  hacsIconStyle,
  hacsCommonClasses,
  hacsLinkStyle,
  hacsButtonStyle,
];
