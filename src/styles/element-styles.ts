import { css } from "lit";
import { haStyleDialog } from "../../homeassistant-frontend/src/resources/styles";

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
    bottom: 152px;
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

export const searchStyles = css`
  search-input.header {
    display: block;
    position: relative;
    left: -22px;
    top: -7px;
    color: var(--secondary-text-color);
    margin-left: 0;
  }
  .search {
    padding: 0 16px;
    background: var(--sidebar-background-color);
    border-bottom: 1px solid var(--divider-color);
  }
  .search search-input {
    position: relative;
    top: 2px;
  }

  search-input {
    --layout-fit_-_right: 100vw;
  }
`;

export const scrollBarStyle = css`
  *::-webkit-scrollbar {
    width: 0.4rem;
    height: 0.4rem;
  }

  *::-webkit-scrollbar-track {
    -webkit-border-radius: 4px;
    border-radius: 4px;
    background: var(--scrollbar-thumb-color);
  }

  *::-webkit-scrollbar-thumb {
    background-color: var(--accent-color);
    border-radius: 0.3em;
  }
  .scroll {
    overflow-y: auto;
    scrollbar-color: var(--scrollbar-thumb-color) transparent;
    scrollbar-width: thin;
  }
`;
export const hacsStyleDialog = [haStyleDialog, css``];
