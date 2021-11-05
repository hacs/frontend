import { css } from "lit";

export const hacsStyleVariables = css`
  :host {
    --hcv-color-error: var(--hacs-error-color, var(--google-red-500, #f44336));
    --hcv-color-warning: var(--hacs-warning-color, #ff8c00);
    --hcv-color-update: var(--hacs-update-color, #f4b400);
    --hcv-color-new: var(--hacs-new-color, var(--google-blue-500, #2196f3));
    --hcv-color-icon: var(--hacs--default-icon-color, var(--sidebar-icon-color));
    --hcv-color-markdown-background: var(--markdown-code-background-color, #f6f8fa);

    --hcv-text-color-primary: var(--primary-text-color);
    --hcv-text-color-on-background: var(--text-primary-color);
    --hcv-text-color-secondary: var(--secondary-text-color);
    --hcv-text-color-link: var(--link-text-color, var(--accent-color));

    --mdc-dialog-heading-ink-color: var(--hcv-text-color-primary);
    --mdc-dialog-content-ink-color: var(--hcv-text-color-primary);

    /*hacs-fab*/
    --hcv-color-fab: var(--hacs-fab-color, var(--accent-color));
    --hcv-text-color-fab: var(--hacs-fab-text-color, var(--hcv-text-color-on-background));

    /*hacs-link*/
    --hcv-text-decoration-link: var(--hacs-link-text-decoration, none);
  }
`;
