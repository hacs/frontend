import { html } from "lit-element";

export const step = html`
  <h1>
    First startup
  </h1>
  <hr />
  <p>
    The first time you start Home Assistant with HACS enabled it needs to get the information about every repository it knows.</br> it is important that you let it finish this before you restart Home Assistant, if your restart before it's finished it needs to start over.
  </p>
  <p>When it's done you will no longer see the progressbar.</p>
  <hacs-progressbar .active=${true}></hacs-progressbar>
  <p>This prosess can take several minuttes depending on your system and network.</p>
`;
