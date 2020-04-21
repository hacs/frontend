// Stolen from https://github.com/home-assistant/frontend/blob/87863021906810f45f78c5bc29e231017c4311b4/src/common/config/is_component_loaded.ts#L1


import { HomeAssistant } from "custom-card-helpers";

/** Return if a integration is loaded. */
export const isIntegrationLoaded = (
  hass: HomeAssistant,
  integration: string
): boolean => hass && hass.config.components.indexOf(integration) !== -1;