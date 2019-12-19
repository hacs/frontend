import { html } from "lit-element";

export const step = html`
  <h1>
    Last words
  </h1>
  <hr />
  <p>
    HACS is mainly developed/maintained by a single person (<hacs-link
      url="https://github.com/ludeeus"
      >@ludeeus</hacs-link
    >), because of this it can take some time before issues are looked at and
    pull requests are reviewed.
  </p>
  <p>
    While you have read trough this onboarding section, HACS has started to get
    information about the repositories it knows, so you will already now see
    items in under the store pages.
  </p>
  <p>
    If you have issues/suggestions regarding HACS, report them here: 
    <hacs-link url="https://hacs.xyz/docs/issues">GitHub</hacs-link>
  </p>
  <p>
    If you have questions regarding HACS please join the
    <hacs-link url="https://discord.gg/apgchf8">Discord server</hacs-link>
  </p>

  </br>
  <p>If you find this custom integration useful please consider supporting me(<hacs-link
      url="https://github.com/ludeeus"
      >@ludeeus</hacs-link
    >)
    <hacs-link url="https://github.com/sponsors/ludeeus">by sponsoring me on GitHub❤️</hacs-link>
    or
    <hacs-link url="https://buymeacoffee.com/ludeeus">buying me ☕️/🍺</hacs-link>
    </p>
`;
