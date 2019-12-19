import { html } from "lit-element";

export const step = html`
  <h1>
    Automation
  </h1>
  <hr />
  <p>
    Automation is at the core of Home Assistant, and parts of HACS may also be
    automated.
  </p>
  <p>Some examples on what can be automated:</p>
  <li>
    <hacs-link
      url="https://hacs.xyz/docs/basic/automation#new-repositories-added"
      >New repository was added to HACS</hacs-link
    >
  </li>
  <li>
    <hacs-link url="https://hacs.xyz/docs/basic/automation#updates-pending"
      >Update pending in HACS</hacs-link
    >
  </li>
`;
