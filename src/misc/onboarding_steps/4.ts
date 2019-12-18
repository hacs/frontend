import { html } from "lit-element";

export const step = html`
  <h1>
    Automation
  </h1>
  <hr />
  <p>
    Automation is at the core of Home Assistant, and parts of HACS can also be
    automated.
  </p>
  <p>For examples on what you can automate have a look at these examples:</p>
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
