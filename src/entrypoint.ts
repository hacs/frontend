// Compat needs to be first import
import "../homeassistant-frontend/src/resources/compatibility";
import { setCancelSyntheticClickEvents } from "@polymer/polymer/lib/utils/settings";
import "../homeassistant-frontend/src/resources/roboto";
import "../homeassistant-frontend/src/resources/ha-style";
import "../homeassistant-frontend/src/resources/safari-14-attachshadow-patch";
import "./main";

setCancelSyntheticClickEvents(false);

const styleEl = document.createElement("style");
styleEl.innerHTML = `
body {
  font-family: Roboto, sans-serif;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-weight: 400;
  margin: 0;
  padding: 0;
  height: 100vh;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #111111;
    color: #e1e1e1;
  }
}
`;
document.head.appendChild(styleEl);
