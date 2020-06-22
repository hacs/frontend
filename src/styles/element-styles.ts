import { css } from "lit-element";

export const hacsLinkStyle = css`
  a {
    text-decoration: var(--hcv-text-decoration-link);
    color: var(--hcv-text-color-link);
  }
`;

export const hacsButtonStyle = css`
  mwc-button[raised] {
    border-radius: 10px;
  }
`;

export const hacsIconStyle = css`
  paper-menu-button,
  ha-icon-button,
  ha-icon {
    color: var(--hcv-color-icon);
  }
`;

export const hassTabsSubpage = css`
  hass-tabs-subpage {
    font-family: var(--paper-font-body1_-_font-family);
    -webkit-font-smoothing: var(--paper-font-body1_-_-webkit-font-smoothing);
    font-size: var(--paper-font-body1_-_font-size);
    font-weight: var(--paper-font-body1_-_font-weight);
    line-height: var(--paper-font-body1_-_line-height);
  }
`;
