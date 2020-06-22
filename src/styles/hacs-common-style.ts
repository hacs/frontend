import { css, CSSResultArray } from "lit-element";
import { hacsIconStyle, hacsButtonStyle, hacsLinkStyle } from "./element-styles";

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
  }
  .header {
    font-size: var(--paper-font-headline_-_font-size);
    opacity: var(--dark-primary-opacity);
    padding: 8px 0 4px 16px;
  }
`;

export const hacsRoot = css`
  :root {
    font-family: var(--paper-font-body1_-_font-family);
    -webkit-font-smoothing: var(--paper-font-body1_-_-webkit-font-smoothing);
    font-size: var(--paper-font-body1_-_font-size);
    font-weight: var(--paper-font-body1_-_font-weight);
    line-height: var(--paper-font-body1_-_line-height);
  }
`;

export const HacsStyles: CSSResultArray = [
  hacsIconStyle,
  hacsButtonStyle,
  hacsCommonClasses,
  hacsLinkStyle,
  hacsRoot,
];
