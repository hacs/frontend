import { html } from "lit-element";

export const step = html`
  <h1>
    First startup
  </h1>
  <hr />
  <p>
	  On the first startup HACS needs to gather information about every extentions repository it knows.</br>
    This process can take several minutes depending on your system and network. 
    Don't restart Home Assistant or the process will have to start over again.
  </p>
  <hacs-progressbar .active=${true}></hacs-progressbar>
  <p>
	  Whenever you see this progressbar, it means that HACS is working in the background. 
    The progressbar will disappear once the process is finished (Upgrade and Uninstall options 
    will be disabled until then).</p> 
  </p>
  <p>The progressbar above is just an example, you can click "Continue" to move to the next step.</p>
  <p>
    NB!: While you read through this onboarding section, HACS is already getting information 
    about the repositories it knows, so you will soon see items appear in the HACS page!
  </p>
`;
