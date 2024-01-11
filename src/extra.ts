import { mainWindow } from "../homeassistant-frontend/src/common/dom/get_main_window";
import { showToast } from "../homeassistant-frontend/src/util/toast";

(() => {
  const haDocument = mainWindow?.document.querySelector("home-assistant");
  const hass = haDocument?.hass;
  if (!hass) {
    console.error("[HACS/reload_handler] hass not found");
    return;
  }
  if ((haDocument as any).___hacs_reload_handler_active) {
    return;
  }
  (haDocument as any).___hacs_reload_handler_active = true;
  hass.connection.subscribeEvents((ev) => {
    console.log(`[HACS/reload_handler] ${JSON.stringify(ev)}`);
    showToast(haDocument, {
      duration: 300 * 1000,
      dismissable: false,
      message: `HACS: ${
        hass.localize("ui.panel.lovelace.reload_lovelace") || "You need to reload your browser"
      }`,
      action: {
        action: () => {
          mainWindow.location.href = mainWindow.location.href;
        },
        text: "reload",
      },
    });
  }, "hacs_resources_updated");
})();
