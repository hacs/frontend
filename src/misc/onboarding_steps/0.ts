import { html } from "lit-element";

export const step = html`
  <h1>
    Welcome to HACS!👋
  </h1>
  <hr />
  <p>
    Congratulations! you have successfully installed HACS 🎉 </br> This onboarding
    process will hopefully help you understand what HACS is and what it does.
  </p>
  <p>To start off here are a few useful links</p>
  <li><hacs-link url="https://hacs.xyz/">HACS Documentation</hacs-link></li>
  <li><hacs-link url="https://github.com/hacs">HACS @ GitHub</hacs-link></li>
  <li><hacs-link url="https://discord.gg/apgchf8">HACS @ Discord</hacs-link></li>
  </br>
  <p><b>NB!: You will only see this onboarding one time so take your time to read all of it.</b></p>
`;
