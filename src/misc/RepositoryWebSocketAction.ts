import { HomeAssistant } from "custom-card-helpers";

export function RepositoryWebSocketAction(
    hass: HomeAssistant,
    repository: string,
    Action: string,
    Data: any = undefined
): void {
    let message: { [x: string]: any; type: string; action?: string; repository?: string; data?: any; id?: number; }
    if (Data !== undefined) {
        message = {
            type: "hacs/repository/data",
            action: Action,
            repository: repository,
            data: Data
        }
    } else {
        message = {
            type: "hacs/repository",
            action: Action,
            repository: repository
        }
    }
    hass.connection.sendMessage(message);
};