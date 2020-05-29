import { css } from "lit-element";

export const HacsCommonStyle = css`
  :root {
    font-family: var(--paper-font-body1_-_font-family);
    -webkit-font-smoothing: var(--paper-font-body1_-_-webkit-font-smoothing);
    font-size: var(--paper-font-body1_-_font-size);
    font-weight: var(--paper-font-body1_-_font-weight);
    line-height: var(--paper-font-body1_-_line-height);
  }

  a {
    text-decoration: none;
    color: var(--link-text-color, var(--accent-color));
  }
  .pending_upgrade,
  .warning {
    color: orange;
  }
  .error {
    color: red;
  }

  .header {
    font-size: var(--paper-font-headline_-_font-size);
    opacity: var(--dark-primary-opacity);
    padding: 8px 0 4px 16px;
  }
  mwc-button[raised] {
    border-radius: 10px;
  }
`;
