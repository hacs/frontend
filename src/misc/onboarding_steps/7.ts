import { html } from "lit-element";

export const step = html`
  <h1>
    Background tasks
  </h1>
  <hr />
  <p>
    If you see this progressbar that means that HACS is working with somwthing
    in the background, some functions like install. upgrade and uninstall is
    disabled while this is running.
  </p>
  <hacs-progressbar .active=${true}></hacs-progressbar>
`;
