import { html } from "lit-element";

export const step = html`
  <h1>
    🚨 Warning
  </h1>
  <hr />
  <p>
  Everything you find in HACS is <b>not</b> tested by Home Assistant, that includes HACS itself.
  </br></br>
  Custom extentions can cause harm to your system and/or contain bugs.</b>
  If you have issues with a custom extension you found in HACS, report it to the author of <i>that</i> custom extension.</b></br>
  You can easily get to the issue tracker of anything you find in HACS with the menu (located at the top right) on every repository you find inside HACS.
  </br></br>
  The HACS and Home Assistant teams do not support <i>anything</i> you find here.
  </p>
`;
