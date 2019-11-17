import { Repository } from "../types";
import { HomeAssistant } from "custom-card-helpers";

export function LoadedInHA(repository: Repository, hass: HomeAssistant): boolean {
    var loaded: boolean = false;
    hass.config.components.forEach(component => {
        if (component.includes(repository.domain)) loaded = true;
    });
    return loaded
}