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

export const fabStyles = css`
  mwc-fab {
    position: fixed;
    bottom: 100px;
    right: 24px;
    z-index: 1;
    margin-bottom: -80px;
    transition: margin-bottom 0.3s;
  }

  mwc-fab[is-wide] {
    bottom: 100px;
    right: 24px;
  }
  mwc-fab[narrow] {
    bottom: 140px;
  }
  mwc-fab[dirty] {
    margin-bottom: 0;
  }

  mwc-fab.rtl {
    right: auto;
    right: 24px;
  }

  mwc-fab[is-wide].rtl {
    bottom: 100px;
    right: auto;
    left: 24px;
  }
`;
