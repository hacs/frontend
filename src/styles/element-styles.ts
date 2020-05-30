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
