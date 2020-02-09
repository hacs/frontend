import { html } from "lit-element";

export const step = html`
  <h1>
    Resources and useful links
  </h1>
  <hr />
  <li><hacs-link url="https://hacs.xyz/">HACS Documentation</hacs-link></li>
  <li><hacs-link url="https://github.com/hacs">HACS @ GitHub</hacs-link></li>
  <li><hacs-link url="https://discord.gg/apgchf8">HACS @ Discord</hacs-link></li>
  <li>
    <hacs-link url="https://hacs.xyz/docs/basic/automation#new-repositories-added"
    >Automation: New repository was added to HACS</hacs-link>
  </li>
  <li>
    <hacs-link url="https://hacs.xyz/docs/basic/automation#updates-pending"
    >Automation: Update pending in HACS</hacs-link>
  </li>
  </br></br>

  <h1>
    Last words
  </h1>
  <hr />
  <p>
    HACS is mainly developed/maintained by a single person (<hacs-link 
    url="https://github.com/ludeeus"
    >@ludeeus</hacs-link>). Because of this, it can take some time 
    before issues are looked at and pull requests are reviewed.
  </p>
  <p>
	  If you have issues/suggestions regarding HACS, report them here: <hacs-link 
    url="https://hacs.xyz/docs/issues"
    >GitHub</hacs-link>
  </p>
  <p>
	  If you have questions regarding HACS please join the <hacs-link 
    url="https://discord.gg/apgchf8"
    >Discord server</hacs-link>
  </p>
  </br>
  <p>
	  If you find this custom integration useful, please consider supporting me by <hacs-link 
    url="https://github.com/sponsors/ludeeus"
    >sponsoring me on GitHub❤️</hacs-link> or <hacs-link 
    url="https://buymeacoffee.com/ludeeus"
    >buying me ☕️/🍺</hacs-link>
  </p>
`;
