import { html } from "lit-element";

export const step = html`
  <h1>
    First startup
  </h1>
  <hr />
  <p>
    The first time you start Home Assistant with HACS enabled it needs to get information about every repository it knows.</br> It is important that you let it finish this process before you restart Home Assistant, if you restart before it's finished it will need to start over.
  </p>
  <p>When it's done you will no longer see the progressbar.</p>
  <hacs-progressbar .active=${true}></hacs-progressbar>
  <p>This process can take several minutes depending on your system and network.</p>
  <p>Again this progressbar is just an example, you can click "Continue" now.</p>
`;
