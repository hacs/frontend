import { html } from "lit-element";

export const step = html`
  <h1>
    Introduction
  </h1>
  <hr />
  <p>
    HACS is a distribution platform that makes it super easy 
	  to find, install and upgrade custom extensions for Home Assistant.
  </p>
  <p>
    Extensions, in this context, are:
  </p>
  <li>
    <hacs-link url="https://www.home-assistant.io/lovelace"
      >Plugins (Lovelace elements)</hacs-link
    >
  </li>
  <li>
    <hacs-link
      url="https://www.home-assistant.io/integrations/frontend/#defining-themes"
      >Themes</hacs-link
    >
  </li>
  <li>
    <hacs-link url="https://developers.home-assistant.io/docs/en/creating_integration_file_structure.html"
    >Custom integrations (custom_components)</hacs-link
    >
  </li>
  <li>
    <hacs-link url="https://appdaemon.readthedocs.io/en/latest/"
      >AppDaemon apps</hacs-link
    >
  </li>
  <li>
    <hacs-link url="https://www.home-assistant.io/integrations/python_script/"
      >Python scripts</hacs-link
    >
  </li>
  </br>
  <h1>
    🚨 Warning
  </h1>
  <hr />
  <p>
    HACS and everything you find in it are <b>not</b> tested by Home Assistant.
  </p>
  <p>
    Custom extentions can cause harm to your system and/or contain bugs.
    If you have issues with a custom extension you found in HACS, 
    report it to the author of <i>that</i> custom extension.
  </p>
  <p>
    You can easily get to the issue tracker of anything you find 
    in HACS with the menu (located at the top right) on every repository you find inside HACS.
    </br></br>
    <b>The HACS and Home Assistant teams do not support <i>anything</i> you find here.</b>
  </p>
`;
