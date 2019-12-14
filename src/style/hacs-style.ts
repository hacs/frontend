import { CSSResultArray, css } from "lit-element";

import { haStyle } from "./ha-style"
import { navStyle } from "./nav-style"

const baseHacsStyles = css`
    :root {
        font-family: var(--paper-font-body1_-_font-family);
        -webkit-font-smoothing: var(--paper-font-body1_-_-webkit-font-smoothing);
        font-size: var(--paper-font-body1_-_font-size);
        font-weight: var(--paper-font-body1_-_font-weight);
        line-height: var(--paper-font-body1_-_line-height);

    }
    a {
        text-decoration: none;
        color: var(--link-color, var(--accent-color));
    }
    h1 {
        font-family: var(--paper-font-title_-_font-family);
        -webkit-font-smoothing: var(--paper-font-title_-_-webkit-font-smoothing);
        white-space: var(--paper-font-title_-_white-space);
        overflow: var(--paper-font-title_-_overflow);
        text-overflow: var(--paper-font-title_-_text-overflow);
        font-size: var(--paper-font-title_-_font-size);
        font-weight: var(--paper-font-title_-_font-weight);
        line-height: var(--paper-font-title_-_line-height);
        @apply --paper-font-title;
    }
    .title {
        margin-bottom: 16px;
        padding-top: 4px;
        color: var(--primary-text-color);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .addition {
        color: var(--secondary-text-color);
        position: relative;
        height: auto;
        line-height: 1.2em;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    ha-card {
        cursor: pointer;
    }
    ha-card {
      margin: 8px;
    }
    ha-icon {
        height: 24px;
        width: 24px;
        margin-right: 16px;
        float: left;
        color: var(--primary-text-color);
    }
    ha-icon.installed {
        color: var(--hacs-status-installed, #126e15);
    }
    ha-icon.pending-upgrade {
        color: var(--hacs-status-pending-update, #ffab40);
    }
    ha-icon.pending-restart {
        color: var(--hacs-status-pending-restart, var(--google-red-500));
    }
    ha-icon.not-loaded {
        color: var(--hacs-status-not-loaded, var(--google-red-500));
    }
    ha-icon.new {
        color: var(--hacs-badge-color, var(--primary-color));
      }
`

const mobileHacsStyles = css`
    @media screen and (max-width: 600px) and (min-width: 0) {
      .MobileHide {
          display: none !important;
      }
      .MobileGrid {
          display: grid !important;
          text-align: center !important;
          position: initial !important;
          width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
      }
      hacs-help-button {
          display: none;
      }
    }
`

export const HacsStyle: CSSResultArray = [haStyle, navStyle, baseHacsStyles, mobileHacsStyles]
